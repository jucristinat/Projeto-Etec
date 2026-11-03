// ===== Navegação entre páginas =====
document.querySelectorAll(".menu button").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".menu button").forEach((b) => b.classList.remove("ativo"));
    document.querySelectorAll(".pagina").forEach((p) => p.classList.remove("ativa"));
    botao.classList.add("ativo");
    document.getElementById(botao.dataset.pagina).classList.add("ativa");
  });
});

// ===== Utilitários =====
const $ = (id) => document.getElementById(id);
const ler = (chave, padrao) => JSON.parse(localStorage.getItem(chave)) ?? padrao;
const gravar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));

function mensagem(el, texto, ok) {
  el.textContent = texto;
  el.className = "msg " + (ok ? "ok" : "falha");
  if (ok) setTimeout(() => (el.textContent = ""), 4000);
}

// Valida campos obrigatórios e marca os vazios
function validar(ids) {
  let valido = true;
  ids.forEach((id) => {
    const campo = $(id);
    const vazio = !campo.value.trim();
    campo.classList.toggle("erro", vazio);
    if (vazio) valido = false;
  });
  return valido;
}

// ===== Cadastro do aluno =====
const camposAluno = ["nome", "rm", "curso", "serie", "turma", "inicioAno", "conclusaoAno"];

function mostrarPerfil() {
  const a = ler("etec-aluno", null);
  const perfil = $("perfil");
  if (!a) { perfil.hidden = true; return; }
  perfil.hidden = false;
  perfil.innerHTML = `
    <h2>🎓 Perfil do aluno</h2>
    <div class="perfil-dados">
      <div><span>Nome</span>${a.nome}</div>
      <div><span>RM</span>${a.rm}</div>
      <div><span>Curso</span>${a.curso}</div>
      <div><span>Série</span>${a.serie} do Ensino Médio</div>
      <div><span>Turma</span>Turma ${a.turma}</div>
      <div><span>Período</span>${a.inicioAno} – ${a.conclusaoAno}</div>
    </div>`;
}

$("formAluno").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("msgAluno");
  if (!validar(camposAluno)) return mensagem(msg, "Preencha todos os campos obrigatórios.", false);

  const inicio = Number($("inicioAno").value);
  const fim = Number($("conclusaoAno").value);
  if (fim < inicio) {
    $("conclusaoAno").classList.add("erro");
    return mensagem(msg, "O ano de conclusão deve ser maior ou igual ao de início.", false);
  }

  const aluno = {};
  camposAluno.forEach((id) => (aluno[id] = $(id).value.trim()));
  gravar("etec-aluno", aluno);
  mostrarPerfil();
  mensagem(msg, "✔ Cadastro realizado com sucesso!", true);
});

// Preenche o formulário com dados salvos
const salvo = ler("etec-aluno", null);
if (salvo) camposAluno.forEach((id) => ($(id).value = salvo[id]));

// ===== Reclamações =====
function escapar(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

function listarReclamacoes() {
  const lista = ler("etec-reclamacoes", []);
  const ul = $("listaRecl");
  if (!lista.length) { ul.innerHTML = '<li class="vazio">Nenhuma manifestação registrada.</li>'; return; }
  ul.innerHTML = lista.slice().reverse().map((r) => `
    <li>
      <strong>${escapar(r.assunto)}</strong><span class="tag">${r.categoria}</span>
      <p>${escapar(r.descricao)}</p>
      <small>${r.data}</small>
    </li>`).join("");
}

$("formRecl").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("msgRecl");
  if (!ler("etec-aluno", null)) return mensagem(msg, "Cadastre-se antes de enviar uma solicitação.", false);
  if (!validar(["assunto", "categoria", "descricao"])) return mensagem(msg, "Preencha todos os campos.", false);

  const lista = ler("etec-reclamacoes", []);
  lista.push({
    assunto: $("assunto").value.trim(),
    categoria: $("categoria").value,
    descricao: $("descricao").value.trim(),
    data: new Date().toLocaleString("pt-BR"),
  });
  gravar("etec-reclamacoes", lista);
  e.target.reset();
  listarReclamacoes();
  mensagem(msg, "✔ Solicitação registrada com sucesso!", true);
});

// ===== Aulas =====
const grade = [
  ["Segunda", "Português", "Matemática", "Programação"],
  ["Terça", "História", "Física", "Banco de Dados"],
  ["Quarta", "Inglês", "Química", "Desenvolvimento Web"],
  ["Quinta", "Geografia", "Biologia", "Redes"],
  ["Sexta", "Educação Física", "Filosofia", "Projeto TCC"],
];
$("gradeAulas").innerHTML = grade.map((l) => "<tr>" + l.map((c) => `<td>${c}</td>`).join("") + "</tr>").join("");

// ===== Faltas =====
const faltas = { "Português": 2, "Matemática": 4, "Programação": 1, "História": 0, "Física": 3, "Banco de Dados": 2 };
$("listaFaltas").innerHTML = Object.entries(faltas)
  .map(([d, n]) => `<div class="falta"><span>${d}</span><strong>${n}</strong></div>`).join("");

// ===== Inicialização =====
mostrarPerfil();
listarReclamacoes();
