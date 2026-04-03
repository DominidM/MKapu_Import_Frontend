import { Component, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../auth/services/auth.service';

type Vista = 'conversaciones' | 'mensajes' | 'nuevo-chat';

@Component({
  selector: 'app-chat-flotante',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DatePipe],
  templateUrl: './chat-flotante.html',
  styleUrl: './chat-flotante.css',
})
export class ChatFlotante {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  panelAbierto        = signal(false);
  vista               = signal<Vista>('conversaciones');
  conversaciones      = signal<any[]>([]);
  conversacionActiva  = signal<any>(null);
  mensajes            = signal<any[]>([]);
  usuariosDisponibles = signal<any[]>([]);
  textoMensaje        = '';
  busquedaUsuario     = '';

  // ── Sonido ────────────────────────────────────────────
  muteado = signal(false);

  toggleMute() {
    this.muteado.update(v => !v);
  }

  private reproducirBeep() {
    if (this.muteado()) return;
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('AudioContext no disponible:', e);
    }
  }

  // ── Auth ──────────────────────────────────────────────
  get miIdCuenta(): number {
    return this.authService.getIdCuenta();
  }

  get miIdSede(): number {
    return this.authService.getCurrentUser()?.idSede ?? 0;
  }

  // ── Computados ────────────────────────────────────────
  totalNoLeidos = computed(() =>
    this.conversaciones().reduce((acc, c) => acc + (Number(c.no_leidos) || 0), 0)
  );

  usuariosFiltrados = computed(() => {
    const busq = this.busquedaUsuario.toLowerCase();
    if (!busq) return this.usuariosDisponibles();
    return this.usuariosDisponibles().filter(u =>
      u.nom_usu?.toLowerCase().includes(busq)
    );
  });

  // ── Panel ─────────────────────────────────────────────
  togglePanel() {
    this.panelAbierto.update(v => !v);
    if (this.panelAbierto()) {
      if (!this.miIdCuenta) return;
      this.vista.set('conversaciones');
      this.cargarConversaciones();
    }
  }

  // ── Conversaciones ────────────────────────────────────
  cargarConversaciones() {
    this.chatService.getMisConversaciones(this.miIdCuenta).subscribe({
      next: (data) => this.conversaciones.set(data),
      error: (err) => console.error('Error cargando conversaciones:', err),
    });
  }

  abrirConversacion(conv: any) {
    this.conversacionActiva.set(conv);
    this.vista.set('mensajes');
    this.cargarMensajes(conv.id_conversacion);
    this.chatService.marcarLeidos(conv.id_conversacion, this.miIdCuenta).subscribe();
  }

  volverLista() {
    this.conversacionActiva.set(null);
    this.vista.set('conversaciones');
    this.cargarConversaciones();
  }

  // ── Mensajes ──────────────────────────────────────────
  cargarMensajes(idConversacion: number) {
    this.chatService.getMensajes(idConversacion).subscribe({
      next: (data) => {
        const cantAnterior = this.mensajes().length;
        this.mensajes.set(data);

        // Beep si llegaron mensajes nuevos de otro usuario
        const ultimo = data[data.length - 1];
        if (data.length > cantAnterior && ultimo?.id_cuenta !== this.miIdCuenta) {
          this.reproducirBeep();
        }

        setTimeout(() => this.scrollAbajo(), 50);
      },
      error: (err) => console.error('Error cargando mensajes:', err),
    });
  }

  enviarMensaje() {
    if (!this.textoMensaje.trim()) return;
    const idConv = this.conversacionActiva()?.id_conversacion;
    this.chatService.enviarMensaje(idConv, this.miIdCuenta, this.textoMensaje).subscribe({
      next: () => {
        this.textoMensaje = '';
        this.cargarMensajes(idConv);
      },
      error: (err) => console.error('Error enviando mensaje:', err),
    });
  }

  // ── Nuevo chat ────────────────────────────────────────
  abrirNuevoChat() {
    this.vista.set('nuevo-chat');
    this.busquedaUsuario = '';
    this.chatService.getUsuariosDisponibles(this.miIdSede, this.miIdCuenta).subscribe({
      next: (data) => this.usuariosDisponibles.set(data),
      error: (err) => console.error('Error cargando usuarios:', err),
    });
  }

  iniciarChatCon(usuario: any) {
    this.chatService.crearConversacionPrivada(
      this.miIdCuenta,
      usuario.id_cuenta,
      this.miIdSede,
    ).subscribe({
      next: (conv) => this.abrirConversacion(conv),
      error: (err) => console.error('Error creando conversación:', err),
    });
  }

  // ── Helpers ───────────────────────────────────────────
  private scrollAbajo() {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}