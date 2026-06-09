import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_FvuOW3sZZOsmDV09wnKQs1EF68tZzJY",
  authDomain: "hijos-de-pe-a.firebaseapp.com",
  projectId: "hijos-de-pe-a",
  storageBucket: "hijos-de-pe-a.firebasestorage.app",
  messagingSenderId: "562678287770",
  appId: "1:562678287770:web:8d66c67da91c747911fe23",
  measurementId: "G-LQK87167ZJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const JERARQUIA_ROLES = ['Líder', 'Comunicador', 'Motivador', 'Ejecutor', 'Estratega'];
const PASS_PROFESOR_FIJA = '1234';

let usuarioLogueado = null; 
let rolLogueado = null; 
let esProfesor = false;
let cronometroIntervalo = null;
let tiempoSegundos = 0;

const els = {
  appShell: document.getElementById('appShell'),
  btnMenu: document.getElementById('btnMenu'),
  navPrincipal: document.getElementById('navPrincipal'),
  statusSesion: document.getElementById('statusSesion'),
  btnSalir: document.getElementById('btnSalir'),
  
  pantallaInicio: document.getElementById('pantallaInicio'),
  pantallaEstudiante: document.getElementById('pantallaEstudiante'),
  pantallaProfesor: document.getElementById('pantallaProfesor'),
  pantallaTrofeos: document.getElementById('pantallaTrofeos'),
  
  btnRolEstudiante: document.getElementById('btnRolEstudiante'),
  btnRolProfesor: document.getElementById('btnRolProfesor'),
  loginProfesor: document.getElementById('loginProfesor'),
  loginEstudiante: document.getElementById('loginEstudiante'),
  inputPassProfesor: document.getElementById('inputPassProfesor'),
  btnEntrarProfesor: document.getElementById('btnEntrarProfesor'),
  inputNombreEstudiante: document.getElementById('inputNombreEstudiante'),
  btnEntrarEstudiante: document.getElementById('btnEntrarEstudiante'),
  cajaSugerencia: document.getElementById('cajaSugerencia'),
  textoFuzzy: document.getElementById('textoFuzzy'),
  btnAceptarSugerencia: document.getElementById('btnAceptarSugerencia'),
  
  stNombre: document.getElementById('stNombre'),
  stRol: document.getElementById('stRol'),
  stPuntos: document.getElementById('stPuntos'),
  stPasos: document.getElementById('stPasos'),
  stCronometro: document.getElementById('stCronometro'),
  seccionEquipo: document.getElementById('seccionEquipo'),
  sinEquipo: document.getElementById('sinEquipo'),
  conEquipo: document.getElementById('conEquipo'),
  panelReclutador: document.getElementById('panelReclutador'),
  listaDisponibles: document.getElementById('listaDisponibles'),
  listaMiembrosEquipo: document.getElementById('listaMiembrosEquipo'),
  nombreEquipoActual: document.getElementById('nombreEquipoActual'),
  bloqueBautizo: document.getElementById('bloqueBautizo'),
  inputNombreEquipo: document.getElementById('inputNombreEquipo'),
  btnGuardarNombreEquipo: document.getElementById('btnGuardarNombreEquipo'),
  
  seccionRuleta: document.getElementById('seccionRuleta'),
  visualRuleta: document.getElementById('visualRuleta'),
  btnGirarRuleta: document.getElementById('btnGirarRuleta'),
  controlReto: document.getElementById('controlReto'),
  ruletaActividad: document.getElementById('ruletaActividad'),
  ruletaDescripcion: document.getElementById('ruletaDescripcion'),
  btnAceptarReto: document.getElementById('btnAceptarReto'),
  btnRechazarReto: document.getElementById('btnRechazarReto'),
  txtPenalizacion: document.getElementById('txtPenalizacion'),
  alertaAdversidad: document.getElementById('alertaAdversidad'),
  txtAdversidad: document.getElementById('txtAdversidad'),
  
  seccionFeedback: document.getElementById('seccionFeedback'),
  selectCompanero: document.getElementById('selectCompanero'),
  textoFeedback: document.getElementById('textoFeedback'),
  checkDesperfeccion: document.getElementById('checkDesperfeccion'),
  btnEnviarFeedback: document.getElementById('btnEnviarFeedback'),
  rankingEquiposGlobal: document.getElementById('rankingEquiposGlobal'),
  
  csvEstudiantes: document.getElementById('csvEstudiantes'),
  csvActividades: document.getElementById('csvActividades'),
  csvAdversidades: document.getElementById('csvAdversidades'),
  btnProcesarCSV: document.getElementById('btnProcesarCSV'),
  btnReiniciarTorneo: document.getElementById('btnReiniciarTorneo'),
  listaFichasProfesores: document.getElementById('listaFichasProfesores'),
  
  contenedorTrofeos: document.getElementById('contenedorTrofeos'),
  linkEstudiante: document.getElementById('linkEstudiante'),
  linkProfesor: document.getElementById('linkProfesor'),
  linkTrofeos: document.getElementById('linkTrofeos'),
  
  modalInvitacion: document.getElementById('modalInvitacion'),
  txtModalInvitacion: document.getElementById('txtModalInvitacion'),
  btnModalAceptar: document.getElementById('btnModalAceptar'),
  btnModalRechazar: document.getElementById('btnModalRechazar')
};

let localEstudiantes = [];
let localActividades = [];
let localAdversidades = [];
let localEquipos = [];
let sugerenciaFuzzyLocal = "";

document.addEventListener("DOMContentLoaded", () => {
  configurarEventosBasicos();
  conectarColeccionesGlobales();
});

function configurarEventosBasicos() {
  els.btnMenu.addEventListener('click', () => els.navPrincipal.classList.toggle('hidden'));
  
  els.btnRolEstudiante.addEventListener('click', () => {
    els.loginEstudiante.classList.remove('hidden');
    els.loginProfesor.classList.add('hidden');
  });
  els.btnRolProfesor.addEventListener('click', () => {
    els.loginProfesor.classList.remove('hidden');
    els.loginEstudiante.classList.add('hidden');
  });
  
  els.btnEntrarProfesor.addEventListener('click', loginProfesorHandler);
  els.btnEntrarEstudiante.addEventListener('click', loginEstudianteHandler);
  els.btnAceptarSugerencia.addEventListener('click', () => {
    els.inputNombreEstudiante.value = sugerenciaFuzzyLocal;
    els.cajaSugerencia.classList.add('hidden');
    loginEstudianteHandler();
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      cambiarVista(e.target.dataset.vista);
      els.navPrincipal.classList.add('hidden');
    });
  });
  
  els.btnSalir.addEventListener('click', cerrarSesionApp);
  els.btnProcesarCSV.addEventListener('click', procesarArchivosCSVProfesor);
  els.btnReiniciarTorneo.addEventListener('click', reiniciarTorneoCompletoProfesor);
  els.stNombre.addEventListener('dblclick', dispararLogroOcultoCurioso);
  els.btnGuardarNombreEquipo.addEventListener('click', guardarNombreEscuadra);
  els.btnGirarRuleta.addEventListener('click', lanzarGiroRuletaLógica);
  els.btnAceptarReto.addEventListener('click', aceptarRetoRuleta);
  els.btnRechazarReto.addEventListener('click', rechazarRetoRuleta);
  els.btnEnviarFeedback.addEventListener('click', subirFeedbackCompanero);
}

function conectarColeccionesGlobales() {
  onSnapshot(collection(db, "estudiantes"), (snapshot) => {
    localEstudiantes = [];
    snapshot.forEach(doc => localEstudiantes.push({ id: doc.id, ...doc.data() }));
    if(usuarioLogueado && !esProfesor) actualizarFlujoEstudianteRealTime();
    if(esProfesor) renderizarExpedientesProfesor();
  });

  onSnapshot(collection(db, "actividades"), (snapshot) => {
    localActividades = [];
    snapshot.forEach(doc => localActividades.push(doc.data()));
  });

  onSnapshot(collection(db, "adversidades"), (snapshot) => {
    localAdversidades = [];
    snapshot.forEach(doc => localAdversidades.push(doc.data()));
  });

  onSnapshot(collection(db, "equipos"), (snapshot) => {
    localEquipos = [];
    snapshot.forEach(doc => localEquipos.push({ id: doc.id, ...doc.data() }));
    renderizarRankingGlobalEquipos();
    if(usuarioLogueado && !esProfesor) {
      actualizarFlujoEstudianteRealTime();
      detectarInvitacionesEntrantesRealTime();
    }
  });
}

function loginProfesorHandler() {
  if (els.inputPassProfesor.value === PASS_PROFESOR_FIJA) {
    esProfesor = true;
    usuarioLogueado = "Profesor Administrador";
    els.statusSesion.textContent = "Profesor Conectado";
    els.linkProfesor.classList.remove('hidden');
    els.linkTrofeos.classList.remove('hidden');
    els.btnSalir.classList.remove('hidden');
    cambiarVista('profesor');
    crearToast("Acceso Concedido, Profesor.", "success");
    renderizarExpedientesProfesor();
  } else {
    crearToast("Contraseña incorrecta", "error");
  }
}

function loginEstudianteHandler() {
  const ingreso = els.inputNombreEstudiante.value.trim();
  if(!ingreso) return crearToast("Escribe un nombre válido", "error");

  const matchExacto = localEstudiantes.find(e => e.id.toLowerCase() === ingreso.toLowerCase());
  if(matchExacto) {
    conectarEstudianteSesion(matchExacto);
    return;
  }

  let mejorMatch = null;
  let menorDistancia = 999;
  
  localEstudiantes.forEach(est => {
    const dist = calcularLevenshtein(ingreso.toLowerCase(), est.id.toLowerCase());
    if(dist < menorDistancia) {
      menorDistancia = dist;
      mejorMatch = est.id;
    }
  });

  if(mejorMatch && menorDistancia <= 6) {
    sugerenciaFuzzyLocal = mejorMatch;
    els.textoFuzzy.textContent = mejorMatch;
    els.cajaSugerencia.classList.remove('hidden');
  } else {
    crearToast("No se encontró ningún estudiante con ese nombre en la base de datos.", "error");
  }
}

function calcularLevenshtein(a, b) {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

async function conectarEstudianteSesion(datosEstudiante) {
  usuarioLogueado = datosEstudiante.id;
  rolLogueado = datosEstudiante.rolDesignado;
  esProfesor = false;
  
  els.statusSesion.textContent = `Alumno: ${usuarioLogueado}`;
  els.linkEstudiante.classList.remove('hidden');
  els.linkTrofeos.classList.remove('hidden');
  els.btnSalir.classList.remove('hidden');
  
  await updateDoc(doc(db, "estudiantes", usuarioLogueado), { sesionIniciadaHoy: true });
  iniciarCronometroSesion();
  cambiarVista('estudiante');
  crearToast(`¡Bienvenido de vuelta, ${usuarioLogueado}!`, "success");
  actualizarFlujoEstudianteRealTime();
}

async function actualizarFlujoEstudianteRealTime() {
  const yo = localEstudiantes.find(e => e.id === usuarioLogueado);
  if(!yo) return;

  els.stNombre.textContent = yo.id;
  els.stRol.textContent = yo.rolDesignado;
  els.stPuntos.textContent = yo.puntos || 0;
  els.stPasos.textContent = yo.pasos || 0;
  
  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));

  if(miEquipo) {
    els.sinEquipo.classList.add('hidden');
    els.conEquipo.classList.remove('hidden');
    els.seccionRuleta.classList.remove('hidden');
    els.seccionFeedback.classList.remove('hidden');
    
    els.nombreEquipoActual.textContent = miEquipo.nombre || "Escuadra sin Nombre Oficial";
    
    if(!miEquipo.nombre && miEquipo.miembros.length >= 3) {
      els.bloqueBautizo.classList.remove('hidden');
    } else {
      els.bloqueBautizo.classList.add('hidden');
    }
    if (miEquipo.miembros.length === 1) {
    // Si está solo, le abrimos a la fuerza el panel para que invite compañeros
    els.panelReclutador.classList.remove('hidden');
    
    const alumnosLibresTotales = localEstudiantes.filter(e => 
      e.id !== usuarioLogueado && 
      !localEquipos.some(eq => eq.miembros && eq.miembros.includes(e.id))
    );
    
    renderizarListaAlumnosLibres(alumnosLibresTotales);
  } else {
    // Si ya tiene más compañeros, dejamos que el flujo siga normal
    els.panelReclutador.classList.add('hidden');
  }

    els.listaMiembrosEquipo.innerHTML = "";
    els.selectCompanero.innerHTML = "";
    miEquipo.miembros.forEach(m => {
      const row = document.createElement('div');
      row.className = "user-row";
      const infoM = localEstudiantes.find(est => est.id === m);
      row.innerHTML = `<span>${m}</span><small class="badge">${infoM ? infoM.rolDesignado : 'Miembro'}</small>`;
      els.listaMiembrosEquipo.appendChild(row);

      if(m !== usuarioLogueado) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        els.selectCompanero.appendChild(opt);
      }
    });

    if(miEquipo.retoActual) {
      els.controlReto.classList.remove('hidden');
      els.ruletaActividad.textContent = miEquipo.retoActual.nombre;
      els.ruletaDescripcion.textContent = miEquipo.retoActual.descripcion;
      els.txtPenalizacion.textContent = `Racha de rechazos actual: ${miEquipo.rachaRechazos || 0}. Penalización acumulada: -${miEquipo.rachaRechazos || 0} pts.`;
    } else {
      els.controlReto.classList.add('hidden');
    }

    if(miEquipo.adversidadActual) {
      els.alertaAdversidad.classList.remove('hidden');
      els.txtAdversidad.textContent = miEquipo.adversidadActual;
    } else {
      els.alertaAdversidad.classList.add('hidden');
    }

  } else {
    els.sinEquipo.classList.remove('hidden');
    els.conEquipo.classList.add('hidden');
    els.seccionRuleta.classList.add('hidden');
    els.seccionFeedback.classList.add('hidden');

    const estudiantesLibresActivos = localEstudiantes.filter(e => 
      e.sesionIniciadaHoy === true && 
      !localEquipos.some(eq => eq.miembros && eq.miembros.includes(e.id))
    );

    let rolConDerechoAInvitar = null;
    for(const rol of JERARQUIA_ROLES) {
      if(estudiantesLibresActivos.some(e => e.rolDesignado === rol)) {
        rolConDerechoAInvitar = rol;
        break;
      }
    }

    if(yo.rolDesignado === rolConDerechoAInvitar) {
      els.panelReclutador.classList.remove('hidden');
      
      const alumnosLibresTotales = localEstudiantes.filter(e => 
        e.id !== usuarioLogueado && 
        !localEquipos.some(eq => eq.miembros && eq.miembros.includes(e.id))
      );

      els.listaDisponibles.innerHTML = "";
      alumnosLibresTotales.forEach(libre => {
        const row = document.createElement('div');
        row.className = "user-row";
        row.innerHTML = `
          <span>${libre.id} (${libre.rolDesignado})</span>
          <button class="accent-btn" data-invitar="${libre.id}">Invitar al Grupo</button>
        `;
        els.listaDisponibles.appendChild(row);
      });

      els.listaDisponibles.querySelectorAll('button[data-invitar]').forEach(btn => {
        btn.addEventListener('click', (e) => enviarInvitaciónNube(e.target.dataset.invitar));
      });

    } else {
      els.panelReclutador.classList.add('hidden');
    }
  }

  renderizarVitrinaDeTrofeos(yo.logros || []);
}

async function enviarInvitaciónNube(nombreDestinatario) {
  let miPreEquipo = localEquipos.find(eq => eq.creador === usuarioLogueado && eq.miembros.length < 5);
  
  if(!miPreEquipo) {
    const nuevoIdEquipo = "equipo_" + Date.now();
    miPreEquipo = {
      id: nuevoIdEquipo,
      creador: usuarioLogueado,
      nombre: "",
      miembros: [usuarioLogueado],
      puntuacionGrupal: 0,
      rachaRechazos: 0,
      invitacionPendientePara: nombreDestinatario
    };
    await setDoc(doc(db, "equipos", nuevoIdEquipo), miPreEquipo);
  } else {
    if(miPreEquipo.miembros.length >= 5) return crearToast("Capacidad máxima de equipo alcanzada (5 integrantes)", "error");
    await updateDoc(doc(db, "equipos", miPreEquipo.id), { invitacionPendientePara: nombreDestinatario });
  }
  crearToast(`Invitación enviada en tiempo real a ${nombreDestinatario}`, "success");
}

function detectarInvitacionesEntrantesRealTime() {
  const invitacion = localEquipos.find(eq => eq.invitacionPendientePara === usuarioLogueado);
  if(invitacion) {
    els.txtModalInvitacion.textContent = `El reclutador asignado "${invitacion.creador}" te ha invitado a sumarte a su escuadra escolar. ¿Aceptas el reto?`;
    els.modalInvitacion.classList.remove('hidden');
    
    els.btnModalAceptar.onclick = () => responderInvitacionNube(invitacion, true);
    els.btnModalRechazar.onclick = () => responderInvitacionNube(invitacion, false);
  } else {
    els.modalInvitacion.classList.add('hidden');
  }
}

async function responderInvitacionNube(equipo, aceptada) {
  els.modalInvitacion.classList.add('hidden');
  if(aceptada) {
    const nuevosMiembros = [...equipo.miembros, usuarioLogueado];
    await updateDoc(doc(db, "equipos", equipo.id), { miembros: nuevosMiembros, invitacionPendientePara: null });
    crearToast("Te has unido al equipo exitosamente", "success");
  } else {
    await updateDoc(doc(db, "equipos", equipo.id), { invitacionPendientePara: null });
    crearToast("Invitación rechazada", "error");
  }
}

async function guardarNombreEscuadra() {
  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));
  const nombrePostulado = els.inputNombreEquipo.value.trim();
  if(!nombrePostulado || !miEquipo) return crearToast("Escribe un nombre válido", "error");

  await updateDoc(doc(db, "equipos", miEquipo.id), { nombre: nombrePostulado });
  crearToast(`Escuadra registrada oficialmente como: "${nombrePostulado}"`, "success");

  for(const miembro of miEquipo.miembros) {
    const datosM = localEstudiantes.find(e => e.id === miembro);
    if(datosM) {
      const listaLogros = datosM.logros || [];
      if(!listaLogros.includes("Principiante Artista")) {
        listaLogros.push("Principiante Artista");
        await updateDoc(doc(db, "estudiantes", miembro), { logros: listaLogros });
      }
    }
  }
}

async function lanzarGiroRuletaLógica() {
  if(localActividades.length === 0) return crearToast("No hay actividades cargadas por el profesor.", "error");
  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));
  if(!miEquipo) return;

  els.visualRuleta.classList.add('spinning');
  els.btnGirarRuleta.disabled = true;

  setTimeout(async () => {
    els.visualRuleta.classList.remove('spinning');
    els.btnGirarRuleta.disabled = false;
    const indiceAzar = Math.floor(Math.random() * localActividades.length);
    const seleccionada = localActividades[indiceAzar];
    await updateDoc(doc(db, "equipos", miEquipo.id), {
      retoActual: { nombre: seleccionada.Nombre_de_la_actividad, descripcion: seleccionada.Descripción }
    });
    crearToast("¡Nuevo desafío arrojado por el destino!", "success");
  }, 1500);
}

async function aceptarRetoRuleta() {
  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));
  if(!miEquipo || !miEquipo.retoActual || localAdversidades.length === 0) return;

  const indAdv = Math.floor(Math.random() * localAdversidades.length);
  const adversidadEscogida = localAdversidades[indAdv].adversidades;

  let rachaAceptacion = miEquipo.rachaAceptacion || 0;
  rachaAceptacion++;

  let desbloqueaEspirituInquebrantable = (rachaAceptacion >= 3);
  let desbloqueaPruebaFuego = (miEquipo.puntuacionGrupal < -3);

  await updateDoc(doc(db, "equipos", miEquipo.id), {
    rachaRechazos: 0,
    rachaAceptacion: rachaAceptacion,
    adversidadActual: adversidadEscogida,
    retoActual: null
  });

  for(const miembro of miEquipo.miembros) {
    const datosM = localEstudiantes.find(e => e.id === miembro);
    if(datosM) {
      let misLogros = datosM.logros || [];
      if(desbloqueaEspirituInquebrantable && !misLogros.includes("Espíritu Inquebrantable")) misLogros.push("Espíritu Inquebrantable");
      if(desbloqueaPruebaFuego && !misLogros.includes("Prueba de Fuego")) misLogros.push("Prueba de Fuego");
      await updateDoc(doc(db, "estudiantes", miembro), { logros: misLogros });
    }
  }
  crearToast("¡Reto aceptado con éxito! Superen la adversidad impuesta.", "success");
}

async function rechazarRetoRuleta() {
  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));
  if(!miEquipo) return;

  const rachaActual = (miEquipo.rachaRechazos || 0) + 1;
  const nuevaPuntuacionGrupal = (miEquipo.puntuacionGrupal || 0) - rachaActual;

  await updateDoc(doc(db, "equipos", miEquipo.id), {
    rachaRechazos: rachaActual,
    rachaAceptacion: 0,
    puntuacionGrupal: nuevaPuntuacionGrupal,
    retoActual: null
  });

  for(const miembro of miEquipo.miembros) {
    const datosM = localEstudiantes.find(e => e.id === miembro);
    const puntosInd = (datosM.puntos || 0) - rachaActual;
    await updateDoc(doc(db, "estudiantes", miembro), { puntos: puntosInd });
  }
  crearToast(`Reto despreciado. Penalización grupal e individual aplicada.`, "error");
}

async function subirFeedbackCompanero() {
  const destino = els.selectCompanero.value;
  const texto = els.textoFeedback.value.trim();
  if(!texto || !destino) return crearToast("Completa los campos de reseña", "error");

  const estudianteDestino = localEstudiantes.find(e => e.id === destino);
  if(!estudianteDestino) return;

  const buzonFeedback = estudianteDestino.feedbacksRecibidos || [];
  buzonFeedback.push({
    emisor: usuarioLogueado,
    mensaje: texto,
    esDesperfeccion: els.checkDesperfeccion.checked,
    fecha: obtenerFechaFormateada()
  });

  await updateDoc(doc(db, "estudiantes", destino), { feedbacksRecibidos: buzonFeedback });
  els.textoFeedback.value = "";
  els.checkDesperfeccion.checked = false;
  crearToast("Feedback inyectado de forma segura en la base de datos.", "success");
}

async function dispararLogroOcultoCurioso() {
  if(esProfesor || !usuarioLogueado) return;
  
  for(let i=0; i<60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    p.style.animationDuration = (Math.random() * 2 + 1) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }

  const yo = localEstudiantes.find(e => e.id === usuarioLogueado);
  if(yo) {
    const misLogros = yo.logros || [];
    if(!misLogros.includes("Más Curioso")) {
      misLogros.push("Más Curioso");
      await updateDoc(doc(db, "estudiantes", usuarioLogueado), { logros: misLogros });
      crearToast("🏆 ¡Desbloqueaste el logro oculto: Más Curioso!", "success");
    }
  }
}

function renderizarVitrinaDeTrofeos(logrosGanados) {
  const poolLogros = [
    { id: "Más Curioso", desc: "Doble clic secreto sobre tu propio nombre en la plataforma.", icon: "🔍" },
    { id: "Principiante Artista", desc: "Formar una escuadra unida y asignarle un nombre oficial.", icon: "🎨" },
    { id: "Espíritu Inquebrantable", desc: "Demostrar alta resiliencia aceptando 3 actividades seguidas sin rechazos.", icon: "🔥" },
    { id: "Prueba de Fuego", desc: "Caer a una puntuación menor a -3 por desprecio de retos y luego aceptar un desafío.", icon: "⚡" },
    { id: "Entre los Muertos", desc: `Equipo campeón del torneo con la puntuación más alta el día de hoy [${obtenerFechaFormateada()}].`, icon: "💀" }
  ];

  let idEquipoGanador = "";
  let puntajeMaximo = -9999;
  localEquipos.forEach(eq => {
    if(eq.nombre && eq.puntuacionGrupal > puntajeMaximo) {
      puntajeMaximo = eq.puntuacionGrupal;
      idEquipoGanador = eq.id;
    }
  });

  const miEquipo = localEquipos.find(eq => eq.miembros && eq.miembros.includes(usuarioLogueado));
  const soyDelEquipoGanador = (miEquipo && miEquipo.id === idEquipoGanador && miEquipo.puntuacionGrupal > 0);

  els.contenedorTrofeos.innerHTML = "";
  poolLogros.forEach(l => {
    let estaDesbloqueado = logrosGanados.includes(l.id);
    if(l.id === "Entre los Muertos" && soyDelEquipoGanador) estaDesbloqueado = true;

    const tCard = document.createElement('div');
    tCard.className = `trophy-card ${estaDesbloqueado ? 'unlocked' : 'locked'}`;
    tCard.innerHTML = `
      <div class="trophy-icon">${l.icon}</div>
      <h4>${l.id}</h4>
      <p class="muted">${l.desc}</p>
      <small>${estaDesbloqueado ? '🟢 Desbloqueado' : '🔒 Bloqueado'}</small>
    `;
    els.contenedorTrofeos.appendChild(tCard);
  });
}

function renderizarRankingGlobalEquipos() {
  els.rankingEquiposGlobal.innerHTML = "";
  const ordenados = [...localEquipos].sort((a,b) => b.puntuacionGrupal - a.puntuacionGrupal);
  
  ordenados.forEach((eq, index) => {
    if(!eq.nombre) return;
    const div = document.createElement('div');
    div.className = "card neon-border";
    div.innerHTML = `
      <h4>#${index+1} ${eq.nombre}</h4>
      <p>Puntos del Grupo: <strong>${eq.puntuacionGrupal}</strong></p>
      <small class="muted">Integrantes asignados: ${eq.miembros ? eq.miembros.length : 0}/5</small>
    `;
    els.rankingEquiposGlobal.appendChild(div);
  });
}

function procesarArchivosCSVProfesor() {
  const fEstudiantes = els.csvEstudiantes.files[0];
  const fActividades = els.csvActividades.files[0];
  const fAdversidades = els.csvAdversidades.files[0];

  if(!fEstudiantes && !fActividades && !fAdversidades) {
    return crearToast("Por lo menos selecciona un archivo CSV para subir a la nube.", "error");
  }

  if(fEstudiantes) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const lineas = e.target.result.split(/\r?\n/);
      for(let i = 1; i < lineas.length; i++) {
        const columna = lineas[i].split(',');
        if(columna.length >= 2) {
          const nombre = columna[0].trim();
          const rol = columna[1].trim();
          if(nombre && rol) {
            await setDoc(doc(db, "estudiantes", nombre), {
              rolDesignado: rol, puntos: 0, pasos: Math.floor(Math.random() * 500), 
              sesionIniciadaHoy: false, logros: [], feedbacksRecibidos: []
            });
          }
        }
      }
      crearToast("CSV de Estudiantes cargado directamente en Firestore.", "success");
    };
    reader.readAsText(fEstudiantes);
  }

  if(fActividades) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const lineas = e.target.result.split(/\r?\n/);
      for(let i = 1; i < lineas.length; i++) {
        const filaCompleta = lineas[i];
        const tokens = filaCompleta.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if(tokens && tokens.length >= 2) {
          const nombreAct = tokens[0].replace(/"/g, "").trim();
          const descAct = tokens[1].replace(/"/g, "").trim();
          await setDoc(doc(db, "actividades", "act_"+i), { Nombre_de_la_actividad: nombreAct, Descripción: descAct });
        }
      }
      crearToast("Pool de Actividades inyectado en la nube.", "success");
    };
    reader.readAsText(fActividades);
  }

  if(fAdversidades) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const lineas = e.target.result.split(/\r?\n/);
      for(let i = 1; i < lineas.length; i++) {
        const advText = lineas[i].trim();
        if(advText && advText !== "adversidades") {
          await setDoc(doc(db, "adversidades", "adv_"+i), { adversidades: advText });
        }
      }
      crearToast("Banco de Adversidades sincronizado en tiempo real.", "success");
    };
    reader.readAsText(fAdversidades);
  }
}
function renderizarExpedientesProfesor() {
  els.listaFichasProfesores.innerHTML = "";
  
  localEstudiantes.forEach(est => {
    const item = document.createElement('div');
    item.className = "accordion-item";
    
    const header = document.createElement('button');
    header.className = "accordion-header";
    header.innerHTML = `<span>👤 ${est.id} [${est.rolDesignado}]</span> <span>⚡ Ver Historial</span>`;
    
    const body = document.createElement('div');
    body.className = "accordion-body hidden";
    
    const feedbacks = est.feedbacksRecibidos || [];
    const desperfecciones = feedbacks.filter(f => f.esDesperfeccion === true).length;
    
    let htmlFeedbacks = "";
    feedbacks.forEach(f => {
      htmlFeedbacks += `<li><strong>${f.emisor}</strong> (${f.fecha}): ${f.mensaje} ${f.esDesperfeccion ? '⚠️' : ''}</li>`;
    });

    body.innerHTML = `
      <p>⏱️ <strong>Tiempo Activo en Sesión:</strong> Mapeado por latidos de navegación activa.</p>
      <p>🏆 <strong>Puntos acumulados individuales:</strong> ${est.puntos || 0} pts.</p>
      <p>👣 <strong>Pasos indirectos registrados:</strong> ${est.pasos || 0} pasos.</p>
      <p>🚨 <strong>Desperfecciones de actitud/frustración reportadas:</strong> ${desperfecciones}</p>
      <h5>Bitácora de Reseñas Recibidas de Co-Workers:</h5>
      <ul>${htmlFeedbacks || '<li>No ha recibido feedbacks en este torneo escolar.</li>'}</ul>
    `;
    
    header.addEventListener('click', () => body.classList.toggle('hidden'));
    
    item.appendChild(header);
    item.appendChild(body);
    els.listaFichasProfesores.appendChild(item);
  });
}
async function reiniciarTorneoCompletoProfesor() {
  const confirmar = confirm("¿Estás completamente seguro de reiniciar todo el torneo? Se borrarán permanentemente todas las escuadras, los puntos individuales, los pasos, los feedbacks y los logros acumulados hoy.");
  if (!confirmar) return;

  try {
    crearToast("Iniciando limpieza general en la nube...", "default");

    // 1. Obtener y vaciar todos los equipos registrados en Firestore
    const queryEquipos = await getDocs(collection(db, "equipos"));
    const promesasEquipos = [];
    queryEquipos.forEach(docSnap => {
      // Dejamos el documento del equipo vacío para removerlo de la interfaz en tiempo real
      promesasEquipos.push(setDoc(doc(db, "equipos", docSnap.id), {}));
    });
    await Promise.all(promesasEquipos);

    // 2. Limpiar las métricas, cronómetros y logros de cada estudiante en la nube
    const promesasEstudiantes = [];
    localEstudiantes.forEach(est => {
      const refEst = doc(db, "estudiantes", est.id);
      promesasEstudiantes.push(updateDoc(refEst, {
        puntos: 0,
        pasos: 0,
        sesionIniciadaHoy: false, // Fuerza el cierre de sesión de los alumnos para reiniciar sus relojes
        logros: [],
        feedbacksRecibidos: [],
        retoActual: null,
        adversidadActual: null
      }));
    });
    await Promise.all(promesasEstudiantes);

    // 3. Notificar éxito y recargar la página para limpiar la pantalla por completo
    crearToast("¡Base de datos limpiada con éxito! Reiniciando entorno...", "success");
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error(error);
    crearToast("Hubo un error al intentar vaciar la base de datos.", "error");
  }
}

function iniciarCronometroSesion() {
  if(cronometroIntervalo) clearInterval(cronometroIntervalo);
  tiempoSegundos = 0;
  cronometroIntervalo = setInterval(() => {
    tiempoSegundos++;
    const min = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
    const seg = String(tiempoSegundos % 60).padStart(2, '0');
    els.stCronometro.textContent = `${min}:${seg}`;
  }, 1000);
}

function cambiarVista(idVista) {
  els.pantallaInicio.classList.add('hidden');
  els.pantallaEstudiante.classList.add('hidden');
  els.pantallaProfesor.classList.add('hidden');
  els.pantallaTrofeos.classList.add('hidden');

  if(idVista === 'inicio') els.pantallaInicio.classList.remove('hidden');
  if(idVista === 'estudiante') els.pantallaEstudiante.classList.remove('hidden');
  if(idVista === 'profesor') els.pantallaProfesor.classList.remove('hidden');
  if(idVista === 'trofeos') els.pantallaTrofeos.classList.remove('hidden');
}

async function cerrarSesionApp() {
  if(usuarioLogueado && !esProfesor) {
    clearInterval(cronometroIntervalo);
    await updateDoc(doc(db, "estudiantes", usuarioLogueado), { sesionIniciadaHoy: false });
  }
  usuarioLogueado = null;
  rolLogueado = null;
  esProfesor = false;
  els.statusSesion.textContent = "Desconectado";
  els.linkEstudiante.classList.add('hidden');
  els.linkProfesor.classList.add('hidden');
  els.linkTrofeos.classList.add('hidden');
  els.btnSalir.classList.add('hidden');
  cambiarVista('inicio');
  crearToast("Sesión cerrada en la nube.", "error");
}

function crearToast(mensaje, tipo = "default") {
  const t = document.createElement('div');
  t.className = `toast \${tipo}`;
  t.textContent = mensaje;
  els.toastZone.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function obtenerFechaFormateada() {
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, '0');
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const aaaa = hoy.getFullYear();
  return `\${dd}/\${mm}/\${aaaa}`;
}
