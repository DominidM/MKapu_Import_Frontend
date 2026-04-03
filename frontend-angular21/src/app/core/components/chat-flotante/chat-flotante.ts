import {
  Component,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { io, Socket } from 'socket.io-client';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../enviroments/enviroment';

type Vista = 'conversaciones' | 'mensajes' | 'nuevo-chat';
type TipoNuevoChat = 'individual' | 'grupo';

@Component({
  selector: 'app-chat-flotante',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DatePipe],
  templateUrl: './chat-flotante.html',
  styleUrl: './chat-flotante.css',
})
export class ChatFlotante implements OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  // ── WebSocket ─────────────────────────────────────────
  private socket: Socket | null = null;
  private salaActual: number | null = null;

  private conectarSocket(): void {
    if (this.socket?.connected) return;

    // Si ya existe un socket desconectado, reconectarlo en vez de crear uno nuevo
    if (this.socket) {
      this.socket.connect();
      return;
    }

    this.socket = io(`${environment.apiUrlSocket}`, {
      path: '/chat/socket.io',
      transports: ['websocket'],
      reconnectionAttempts: Infinity, 
      reconnectionDelay: 3000,        
      reconnectionDelayMax: 10000,     
      timeout: 8000,
    });

    this.socket.on('connect', () => {
      console.log('[Chat WS] conectado');
      if (this.salaActual) this.unirseASala(this.salaActual);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Chat WS] no disponible:', err.message);
    });

  this.socket.on('new_message', (msg: any) => {
    const existe = this.mensajes().some(m => m.id_mensaje === msg.id_mensaje);
    if (!existe) {
      //    sin importar si el panel está abierto o no
      if (msg.id_cuenta !== this.miIdCuenta) {
        this.reproducirBeep();
      }

      // Solo actualizar la lista de mensajes si la conversación está activa
      if (this.conversacionActiva()?.id_conversacion === msg.id_conversacion) {
        this.mensajes.set([...this.mensajes(), msg]);
        setTimeout(() => this.scrollAbajo(), 50);
      }

      // Siempre actualizar el contador de no leídos
      this.cargarConversaciones();
    }
  });

    this.socket.on('update_no_leidos', () => this.cargarConversaciones());
    this.socket.on('messages_read',    () => this.cargarConversaciones());
  }

  private unirseASala(idConversacion: number): void {
    this.socket?.emit('join_conversation', { id_conversacion: idConversacion });
    this.salaActual = idConversacion;
  }

  private salirDeSala(idConversacion: number): void {
    this.socket?.emit('leave_conversation', { id_conversacion: idConversacion });
    this.salaActual = null;
  }

  ngOnDestroy(): void {
    if (this.salaActual) this.salirDeSala(this.salaActual);
    this.socket?.disconnect();
  }

  // ── Estado ────────────────────────────────────────────
  panelAbierto       = signal(false);
  vista              = signal<Vista>('conversaciones');
  conversaciones     = signal<any[]>([]);
  conversacionActiva = signal<any>(null);
  mensajes           = signal<any[]>([]);
  textoMensaje       = '';

  usuariosDisponibles   = signal<any[]>([]);
  cargandoUsuarios      = signal(false);
  busquedaUsuario       = signal('');
  tipoNuevoChat         = signal<TipoNuevoChat>('individual');
  usuariosSeleccionados = signal<any[]>([]);
  nombreGrupo           = '';
  muteado               = signal(false);

  toggleMute() { this.muteado.update(v => !v); }

  private reproducirBeep() {
    if (this.muteado()) return;
    try {
      const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch (e) { console.warn('AudioContext no disponible:', e); }
  }

  get miIdCuenta(): number { return this.authService.getIdCuenta(); }
  get miIdSede(): number   { return this.authService.getCurrentUser()?.idSede ?? 0; }

  totalNoLeidos = computed(() =>
    this.conversaciones().reduce((acc, c) => acc + (Number(c.no_leidos) || 0), 0)
  );

  usuariosFiltrados = computed(() => {
    const busq = this.busquedaUsuario().toLowerCase().trim();
    const todos = this.usuariosDisponibles();
    if (!busq) return todos;
    return todos.filter(u =>
      u.nom_usu?.toLowerCase().includes(busq) ||
      u.email_emp?.toLowerCase().includes(busq)
    );
  });

  // En togglePanel(), mover la conexión fuera del if
  togglePanel() {
    this.panelAbierto.update(v => !v);
    if (this.panelAbierto()) {
      if (!this.miIdCuenta) return;
      this.vista.set('conversaciones');
      this.cargarConversaciones();
    }
  }

  // Conectar en ngOnInit o en el constructor
  ngOnInit(): void {
    if (this.miIdCuenta) {
      this.conectarSocket();
    }
  }

  // ── Conversaciones ────────────────────────────────────
  cargarConversaciones() {
    this.chatService.getMisConversaciones(this.miIdCuenta).subscribe({
      next:  d => this.conversaciones.set(d),
      error: e => console.error('Error cargando conversaciones:', e),
    });
  }

  abrirConversacion(conv: any) {
    if (this.salaActual && this.salaActual !== conv.id_conversacion) {
      this.salirDeSala(this.salaActual);
    }
    this.conversacionActiva.set(conv);
    this.vista.set('mensajes');
    this.cargarMensajes(conv.id_conversacion);
    this.unirseASala(conv.id_conversacion);
    this.chatService.marcarLeidos(conv.id_conversacion, this.miIdCuenta).subscribe();
  }

  volverLista() {
    if (this.salaActual) this.salirDeSala(this.salaActual);
    this.conversacionActiva.set(null);
    this.vista.set('conversaciones');
    this.cargarConversaciones();
  }

  // ── Mensajes ──────────────────────────────────────────
  cargarMensajes(idConversacion: number) {
    this.chatService.getMensajes(idConversacion).subscribe({
      next: d => { this.mensajes.set(d); setTimeout(() => this.scrollAbajo(), 50); },
      error: e => console.error('Error cargando mensajes:', e),
    });
  }

  enviarMensaje() {
    if (!this.textoMensaje.trim()) return;
    const idConv    = this.conversacionActiva()?.id_conversacion;
    const contenido = this.textoMensaje.trim();
    this.textoMensaje = '';

    if (this.socket?.connected) {
      // Envío por WebSocket — el gateway emite 'new_message' a toda la sala
      this.socket.emit('send_message', {
        id_conversacion: idConv,
        id_cuenta:       this.miIdCuenta,
        contenido,
      });
    } else {
      // Fallback HTTP si WS no está disponible
      this.chatService.enviarMensaje(idConv, this.miIdCuenta, contenido).subscribe({
        next:  msg => { this.mensajes.update(msgs => [...msgs, msg]); setTimeout(() => this.scrollAbajo(), 50); },
        error: err => console.error('Error enviando mensaje:', err),
      });
    }
  }

  // ── Nuevo chat ────────────────────────────────────────
  abrirNuevoChat() {
    this.vista.set('nuevo-chat');
    this.busquedaUsuario.set('');
    this.nombreGrupo = '';
    this.tipoNuevoChat.set('individual');
    this.usuariosSeleccionados.set([]);
    this.cargandoUsuarios.set(true);
    this.chatService.getUsuariosDisponibles(this.miIdSede, this.miIdCuenta).subscribe({
      next:  d => { this.usuariosDisponibles.set(d); this.cargandoUsuarios.set(false); },
      error: e => { console.error(e); this.cargandoUsuarios.set(false); },
    });
  }

  iniciarChatCon(usuario: any) {
    this.chatService.crearConversacionPrivada(this.miIdCuenta, usuario.id_cuenta, this.miIdSede)
      .subscribe({ next: conv => this.abrirConversacion(conv), error: e => console.error(e) });
  }

  toggleSeleccion(usuario: any) {
    const actual = this.usuariosSeleccionados();
    const existe = actual.find(u => u.id_cuenta === usuario.id_cuenta);
    this.usuariosSeleccionados.set(
      existe ? actual.filter(u => u.id_cuenta !== usuario.id_cuenta) : [...actual, usuario]
    );
  }

  estaSeleccionado(idCuenta: number): boolean {
    return this.usuariosSeleccionados().some(u => u.id_cuenta === idCuenta);
  }

  onCrearGrupoClick() {
    if (this.usuariosSeleccionados().length === 0 || !this.nombreGrupo.trim()) return;
    this.crearGrupo();
  }

  crearGrupo() {
    const ids = [...this.usuariosSeleccionados().map(u => u.id_cuenta), this.miIdCuenta];
    this.chatService.crearGrupo(this.nombreGrupo.trim(), ids, this.miIdSede)
      .subscribe({ next: conv => this.abrirConversacion(conv), error: e => console.error(e) });
  }

  private scrollAbajo() {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}