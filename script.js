const chaveArmazenamentoUsuarios = "usuariosSpeedrunners";
const chaveArmazenamentoTema = "temaSpeedrunners";

const paineisTela = document.querySelectorAll(".painelTela");
const botoesNavegacao = document.querySelectorAll(".botaoNavegacao");
const botaoAlternarTema = document.getElementById("botaoAlternarTema");
const linkMarca = document.querySelector(".linkMarca");

const formularioUsuario = document.getElementById("formularioUsuario");
const campoNomeUsuario = document.getElementById("campoNomeUsuario");
const campoEmailUsuario = document.getElementById("campoEmailUsuario");
const campoCpfUsuario = document.getElementById("campoCpfUsuario");
const campoIdadeUsuario = document.getElementById("campoIdadeUsuario");
const botaoSalvarUsuario = document.getElementById("botaoSalvarUsuario");
const retornoFormularioUsuario = document.getElementById("retornoFormularioUsuario");
const campoBuscaUsuario = document.getElementById("campoBuscaUsuario");
const corpoTabelaUsuarios = document.getElementById("corpoTabelaUsuarios");
const mensagemUsuariosVazia = document.getElementById("mensagemUsuariosVazia");
const botaoLimparUsuarios = document.getElementById("botaoLimparUsuarios");
const valorTotalUsuarios = document.getElementById("valorTotalUsuarios");
const valorUsuariosMaiores = document.getElementById("valorUsuariosMaiores");
const valorUsuarioMaisJovem = document.getElementById("valorUsuarioMaisJovem");

const formularioCep = document.getElementById("formularioCep");
const campoCep = document.getElementById("campoCep");
const erroCep = document.getElementById("erroCep");
const retornoCep = document.getElementById("retornoCep");
const campoRua = document.getElementById("campoRua");
const campoBairro = document.getElementById("campoBairro");
const campoCidade = document.getElementById("campoCidade");
const campoEstado = document.getElementById("campoEstado");

const camposFormularioUsuario = {
  nomeUsuario: {
    campo: campoNomeUsuario,
    erro: document.getElementById("erroNomeUsuario"),
    validar: validarNomeUsuario
  },
  emailUsuario: {
    campo: campoEmailUsuario,
    erro: document.getElementById("erroEmailUsuario"),
    validar: validarEmailUsuario
  },
  cpfUsuario: {
    campo: campoCpfUsuario,
    erro: document.getElementById("erroCpfUsuario"),
    validar: validarCpfUsuario
  },
  idadeUsuario: {
    campo: campoIdadeUsuario,
    erro: document.getElementById("erroIdadeUsuario"),
    validar: validarIdadeUsuario
  }
};

let listaUsuarios = carregarListaUsuarios();
let identificadorUsuarioEmEdicao = null;

aplicarTemaArmazenado();
exibirListaUsuarios();
atualizarResumoUsuarios();

linkMarca.addEventListener("click", (evento) => {
  evento.preventDefault();
  mostrarTela("telaCadastro");
});

botoesNavegacao.forEach((botaoNavegacao) => {
  botaoNavegacao.addEventListener("click", () => {
    mostrarTela(botaoNavegacao.dataset.telaDestino);
  });
});

botaoAlternarTema.addEventListener("click", alternarTema);

Object.values(camposFormularioUsuario).forEach((configuracaoCampo) => {
  configuracaoCampo.campo.addEventListener("input", () => validarCampoFormulario(configuracaoCampo));
});

campoCpfUsuario.addEventListener("input", () => {
  campoCpfUsuario.value = formatarCpf(campoCpfUsuario.value);
});

formularioUsuario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  salvarUsuario();
});

formularioUsuario.addEventListener("reset", () => {
  window.setTimeout(() => {
    identificadorUsuarioEmEdicao = null;
    botaoSalvarUsuario.textContent = "Salvar speedrunner";
    limparValidacaoUsuario();
    definirRetornoFormularioUsuario("");
  }, 0);
});

campoBuscaUsuario.addEventListener("input", exibirListaUsuarios);

corpoTabelaUsuarios.addEventListener("click", (evento) => {
  const botaoAcao = evento.target.closest("[data-acao]");

  if (!botaoAcao) {
    return;
  }

  const identificadorUsuario = botaoAcao.dataset.identificadorUsuario;
  const acaoUsuario = botaoAcao.dataset.acao;

  if (acaoUsuario === "editar") {
    iniciarEdicaoUsuario(identificadorUsuario);
  }

  if (acaoUsuario === "excluir") {
    excluirUsuario(identificadorUsuario);
  }
});

botaoLimparUsuarios.addEventListener("click", limparTodosUsuarios);

campoCep.addEventListener("input", () => {
  campoCep.value = formatarCep(campoCep.value);
  erroCep.textContent = "";
  definirRetornoCep("");
});

campoCep.addEventListener("blur", () => {
  if (manterSomenteDigitos(campoCep.value).length === 8) {
    consultarCep();
  }
});

formularioCep.addEventListener("submit", (evento) => {
  evento.preventDefault();
  consultarCep();
});

function mostrarTela(identificadorTela) {
  paineisTela.forEach((painelTela) => {
    const telaSelecionada = painelTela.id === identificadorTela;
    painelTela.hidden = !telaSelecionada;
    painelTela.classList.toggle("ativo", telaSelecionada);
  });

  botoesNavegacao.forEach((botaoNavegacao) => {
    const botaoSelecionado = botaoNavegacao.dataset.telaDestino === identificadorTela;
    botaoNavegacao.classList.toggle("ativo", botaoSelecionado);
    botaoNavegacao.setAttribute("aria-pressed", String(botaoSelecionado));
  });
}

function aplicarTemaArmazenado() {
  const temaArmazenado = localStorage.getItem(chaveArmazenamentoTema);
  const temaSeguro = temaArmazenado === "escuro" ? "escuro" : "claro";

  document.documentElement.dataset.tema = temaSeguro;
  atualizarBotaoTema(temaSeguro);
}

function alternarTema() {
  const temaAtual = document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
  const proximoTema = temaAtual === "escuro" ? "claro" : "escuro";

  document.documentElement.dataset.tema = proximoTema;
  localStorage.setItem(chaveArmazenamentoTema, proximoTema);
  atualizarBotaoTema(proximoTema);
}

function atualizarBotaoTema(nomeTema) {
  const temaEscuroAtivo = nomeTema === "escuro";

  botaoAlternarTema.textContent = temaEscuroAtivo ? "Tema claro" : "Tema escuro";
  botaoAlternarTema.setAttribute("aria-pressed", String(temaEscuroAtivo));
}

function carregarListaUsuarios() {
  const usuariosArmazenados = localStorage.getItem(chaveArmazenamentoUsuarios);

  if (!usuariosArmazenados) {
    return [];
  }

  try {
    const usuariosConvertidos = JSON.parse(usuariosArmazenados);
    return Array.isArray(usuariosConvertidos) ? usuariosConvertidos : [];
  } catch (erro) {
    return [];
  }
}

function salvarListaUsuariosNoNavegador() {
  localStorage.setItem(chaveArmazenamentoUsuarios, JSON.stringify(listaUsuarios));
}

function validarCampoFormulario(configuracaoCampo) {
  const mensagemErro = configuracaoCampo.validar(configuracaoCampo.campo.value);
  configuracaoCampo.erro.textContent = mensagemErro;
  configuracaoCampo.campo.setAttribute("aria-invalid", String(Boolean(mensagemErro)));

  return !mensagemErro;
}

function validarFormularioUsuario() {
  return Object.values(camposFormularioUsuario).every(validarCampoFormulario);
}

function validarNomeUsuario(valor) {
  const valorSemEspacos = valor.trim();

  if (valorSemEspacos.length < 3) {
    return "Informe um nome com pelo menos 3 caracteres.";
  }

  return "";
}

function validarEmailUsuario(valor) {
  const valorSemEspacos = valor.trim();
  const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!padraoEmail.test(valorSemEspacos)) {
    return "Informe um e-mail válido.";
  }

  return "";
}

function validarCpfUsuario(valor) {
  const cpfSomenteNumeros = manterSomenteDigitos(valor);

  if (cpfSomenteNumeros.length !== 11 || /^(\d)\1+$/.test(cpfSomenteNumeros)) {
    return "Informe um CPF válido.";
  }

  if (!cpfEstaValido(cpfSomenteNumeros)) {
    return "CPF inválido.";
  }

  const cpfJaCadastrado = listaUsuarios.some((usuario) => {
    return usuario.cpfUsuario === formatarCpf(cpfSomenteNumeros) && usuario.identificador !== identificadorUsuarioEmEdicao;
  });

  if (cpfJaCadastrado) {
    return "Este CPF já foi cadastrado.";
  }

  return "";
}

function validarIdadeUsuario(valor) {
  const idadeUsuario = Number(valor);

  if (!Number.isInteger(idadeUsuario) || idadeUsuario < 6 || idadeUsuario > 120) {
    return "Informe uma idade entre 6 e 120 anos.";
  }

  return "";
}

function cpfEstaValido(cpfSomenteNumeros) {
  const digitosCpf = cpfSomenteNumeros.split("").map(Number);
  const primeiroDigito = calcularDigitoCpf(digitosCpf.slice(0, 9));
  const segundoDigito = calcularDigitoCpf(digitosCpf.slice(0, 10));

  return primeiroDigito === digitosCpf[9] && segundoDigito === digitosCpf[10];
}

function calcularDigitoCpf(digitosCpf) {
  const pesoInicial = digitosCpf.length + 1;
  const valorTotal = digitosCpf.reduce((total, digito, indice) => {
    return total + digito * (pesoInicial - indice);
  }, 0);
  const restoDivisao = (valorTotal * 10) % 11;

  return restoDivisao === 10 ? 0 : restoDivisao;
}

function salvarUsuario() {
  if (!validarFormularioUsuario()) {
    definirRetornoFormularioUsuario("Revise os campos destacados antes de salvar.", true);
    return;
  }

  const dadosUsuario = {
    identificador: identificadorUsuarioEmEdicao || criarIdentificadorUsuario(),
    nomeUsuario: campoNomeUsuario.value.trim(),
    emailUsuario: campoEmailUsuario.value.trim().toLowerCase(),
    cpfUsuario: formatarCpf(campoCpfUsuario.value),
    idadeUsuario: Number(campoIdadeUsuario.value),
    atualizadoEm: new Date().toISOString()
  };

  if (identificadorUsuarioEmEdicao) {
    listaUsuarios = listaUsuarios.map((usuario) => {
      return usuario.identificador === identificadorUsuarioEmEdicao ? dadosUsuario : usuario;
    });
    definirRetornoFormularioUsuario("Speedrunner atualizado com sucesso.");
  } else {
    listaUsuarios.push(dadosUsuario);
    definirRetornoFormularioUsuario("Speedrunner cadastrado com sucesso.");
  }

  salvarListaUsuariosNoNavegador();
  exibirListaUsuarios();
  atualizarResumoUsuarios();
  limparCamposFormularioUsuario();
  identificadorUsuarioEmEdicao = null;
  botaoSalvarUsuario.textContent = "Salvar speedrunner";
  limparValidacaoUsuario();
}

function criarIdentificadorUsuario() {
  return `Speedrunner${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function exibirListaUsuarios() {
  const valorBusca = campoBuscaUsuario.value.trim().toLowerCase();
  const usuariosFiltrados = listaUsuarios
    .filter((usuario) => {
      const textoPesquisavel = `${usuario.nomeUsuario} ${usuario.emailUsuario} ${usuario.cpfUsuario}`.toLowerCase();
      return textoPesquisavel.includes(valorBusca);
    })
    .sort((primeiroUsuario, segundoUsuario) => primeiroUsuario.nomeUsuario.localeCompare(segundoUsuario.nomeUsuario));

  corpoTabelaUsuarios.innerHTML = "";

  usuariosFiltrados.forEach((usuario, indice) => {
    const linhaTabela = document.createElement("tr");

    linhaTabela.innerHTML = `
      <td>${indice + 1}</td>
      <td>${escaparHtml(usuario.nomeUsuario)}</td>
      <td>${escaparHtml(usuario.emailUsuario)}</td>
      <td>${escaparHtml(usuario.cpfUsuario)}</td>
      <td>${usuario.idadeUsuario}</td>
      <td>
        <div class="acoesTabela">
          <button class="botaoPequeno" type="button" data-acao="editar" data-identificador-usuario="${usuario.identificador}">Editar</button>
          <button class="botaoPequeno" type="button" data-acao="excluir" data-identificador-usuario="${usuario.identificador}">Excluir</button>
        </div>
      </td>
    `;

    corpoTabelaUsuarios.appendChild(linhaTabela);
  });

  mensagemUsuariosVazia.hidden = usuariosFiltrados.length > 0;
}

function atualizarResumoUsuarios() {
  const totalUsuarios = listaUsuarios.length;
  const usuariosMaiores = listaUsuarios.filter((usuario) => usuario.idadeUsuario >= 18).length;
  const usuarioMaisJovem = listaUsuarios.reduce((maisJovem, usuario) => {
    if (!maisJovem || usuario.idadeUsuario < maisJovem.idadeUsuario) {
      return usuario;
    }

    return maisJovem;
  }, null);

  valorTotalUsuarios.textContent = String(totalUsuarios);
  valorUsuariosMaiores.textContent = String(usuariosMaiores);
  valorUsuarioMaisJovem.textContent = usuarioMaisJovem ? `${usuarioMaisJovem.idadeUsuario} anos` : "--";
}

function iniciarEdicaoUsuario(identificadorUsuario) {
  const usuarioSelecionado = listaUsuarios.find((usuario) => usuario.identificador === identificadorUsuario);

  if (!usuarioSelecionado) {
    return;
  }

  identificadorUsuarioEmEdicao = usuarioSelecionado.identificador;
  campoNomeUsuario.value = usuarioSelecionado.nomeUsuario;
  campoEmailUsuario.value = usuarioSelecionado.emailUsuario;
  campoCpfUsuario.value = usuarioSelecionado.cpfUsuario;
  campoIdadeUsuario.value = usuarioSelecionado.idadeUsuario;
  botaoSalvarUsuario.textContent = "Atualizar speedrunner";
  limparValidacaoUsuario();
  definirRetornoFormularioUsuario("Edite os dados e salve novamente.");
  mostrarTela("telaCadastro");
  campoNomeUsuario.focus();
}

function excluirUsuario(identificadorUsuario) {
  const usuarioSelecionado = listaUsuarios.find((usuario) => usuario.identificador === identificadorUsuario);

  if (!usuarioSelecionado) {
    return;
  }

  const deveExcluirUsuario = window.confirm(`Excluir ${usuarioSelecionado.nomeUsuario}?`);

  if (!deveExcluirUsuario) {
    return;
  }

  listaUsuarios = listaUsuarios.filter((usuario) => usuario.identificador !== identificadorUsuario);
  salvarListaUsuariosNoNavegador();
  exibirListaUsuarios();
  atualizarResumoUsuarios();
}

function limparTodosUsuarios() {
  if (listaUsuarios.length === 0) {
    return;
  }

  const deveLimparUsuarios = window.confirm("Apagar todos os speedrunners cadastrados?");

  if (!deveLimparUsuarios) {
    return;
  }

  listaUsuarios = [];
  salvarListaUsuariosNoNavegador();
  exibirListaUsuarios();
  atualizarResumoUsuarios();
  definirRetornoFormularioUsuario("");
}

async function consultarCep() {
  const cepSomenteNumeros = manterSomenteDigitos(campoCep.value);

  if (cepSomenteNumeros.length !== 8) {
    erroCep.textContent = "Informe um CEP com 8 números.";
    limparCamposEndereco();
    definirRetornoCep("Não foi possível consultar o CEP.", true);
    return;
  }

  erroCep.textContent = "";
  definirRetornoCep("Consultando CEP...");

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);

    if (!resposta.ok) {
      throw new Error("A API não respondeu corretamente.");
    }

    const dadosCep = await resposta.json();

    if (dadosCep.erro) {
      limparCamposEndereco();
      definirRetornoCep("CEP não encontrado.", true);
      return;
    }

    campoRua.value = dadosCep.logradouro || "Não informado";
    campoBairro.value = dadosCep.bairro || "Não informado";
    campoCidade.value = dadosCep.localidade || "Não informado";
    campoEstado.value = dadosCep.uf || "Não informado";
    definirRetornoCep("Endereço carregado com sucesso.");
  } catch (erro) {
    limparCamposEndereco();
    definirRetornoCep("Erro ao consultar a API de CEP. Tente novamente.", true);
  }
}

function limparCamposEndereco() {
  campoRua.value = "";
  campoBairro.value = "";
  campoCidade.value = "";
  campoEstado.value = "";
}

function definirRetornoFormularioUsuario(mensagem, erro = false) {
  retornoFormularioUsuario.textContent = mensagem;
  retornoFormularioUsuario.classList.toggle("erro", erro);
}

function definirRetornoCep(mensagem, erro = false) {
  retornoCep.textContent = mensagem;
  retornoCep.classList.toggle("erro", erro);
}

function limparValidacaoUsuario() {
  Object.values(camposFormularioUsuario).forEach((configuracaoCampo) => {
    configuracaoCampo.erro.textContent = "";
    configuracaoCampo.campo.removeAttribute("aria-invalid");
  });
}

function limparCamposFormularioUsuario() {
  campoNomeUsuario.value = "";
  campoEmailUsuario.value = "";
  campoCpfUsuario.value = "";
  campoIdadeUsuario.value = "";
}

function manterSomenteDigitos(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCpf(valor) {
  const digitos = manterSomenteDigitos(valor).slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarCep(valor) {
  const digitos = manterSomenteDigitos(valor).slice(0, 8);

  return digitos.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

function escaparHtml(valor) {
  const elementoTemporario = document.createElement("span");
  elementoTemporario.textContent = valor;

  return elementoTemporario.innerHTML;
}
