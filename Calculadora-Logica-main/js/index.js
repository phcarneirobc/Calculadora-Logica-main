const OPERATORS = ["∼", "∧", "⊻", "∨", "→", "↔"];
var expression = "";
var darkMode = true;

// Restante do código...

function insert(str) {
  // Insere o valor digitado na expressão
  if (str === "∼") {
    if (expression.slice(-1) === "∼") return;
  } else {
    if (
      is_logical_operator(str) &&
      is_logical_operator(expression.slice(-1))
    )
      return;
    if (is_logical_operator(str) && expression.slice(-1) === "") return;
  }
  if (
    (is_variable(str) ||
      str === "[Verdadeiro]" ||
      str === "[Falso]") &&
    (is_variable(expression.slice(-1)) ||
      expression.match(/\[(?:Verdadeiro|Falso)\]$/))
  )
    return;
  if (str === "(" && is_variable(expression.slice(-1))) return;
  if (
    str === ")" &&
    expression.replace(/[^\(]/g, "").length <=
      expression.replace(/[^\)]/g, "").length
  )
    return;
  if (str === ")" && expression.slice(-1) === "(") return;

  expression = expression + str;
  update_expression();
}

function update_expression() {
  // Atualiza a expressão
  document.querySelector("#display").innerHTML = expression;
}

function clear_screen() {
  // Limpa a expressão
  if (expression != "") {
    clear_expression();
  } else {
    clear_result();
  }
}

function clear_expression() {
  expression = "";
  update_expression();
}

function clear_result() {
  // Limpa o resultado
  document.getElementById("result").innerHTML = "";
  document.getElementById("table-test").innerHTML = "";
}

function backspace() {
  // Apaga o último valor digitado
  expression = expression.substring(0, expression.length - 1);
  update_expression();
}

function calculate() {
  // Calcula o resultado
  if (expression != "") {
    structure_answer();
    clear_expression();
  }
}

// Restante do código...

// ===== Conversores ===============================================================================

function ord(char) {
  // Retorna o valor da tabela ASCII
  return char.charCodeAt(0)
}

function chr(code) {
  // Retorna a posição da tabela ASCII
  return String.fromCharCode(code)
}

// ===== Checagens =================================================================================

function is_repeated_var(str, array) {
  // Checa se a variável já existe no array
  for (let v of array) {
    if (str === v) return true
  }
  return false
}

function is_logical_operator(str) {
  // Checa se é um operador lógico
  for (let element of OPERATORS) {
    if (str == element) return true
  }
  return false
}

function is_variable(str) {
  // Checa se é uma variável
  if (ord(str) > 64 && ord(str) < 91) return true
  return false
}

function is_tautology(array) {
  //Checa se a ultima coluna da tabela-resposta é uma tautologia
  for (let element of array) {
    if (element === "F") return false
  }
  return true
}

function is_contradiction(array) {
  //Checa se a ultima coluna da tabela-resposta é uma contradição
  for (let element of array) {
    if (element === "V") return false
  }
  return true
}

function is_contigency(array) {
  //Checa se a ultima coluna da tabela-resposta é uma contigência
  let v_count = 0
  let f_count = 0

  for (let element of array) {
    if (element === "V") v_count++
    if (element === "F") f_count++
    if (v_count > 0 && f_count > 0) return true
  }
  return false
}

// ===== Cálculos ==================================================================================

function correct_expression(texto) {
  // Corrige a expressão
  texto = `${texto}${
    expression.replace(/[^\(]/g, "").length >
    expression.replace(/[^\)]/g, "").length
      ? ")".repeat(
          expression.replace(/[^\(]/g, "").length -
            expression.replace(/[^\)]/g, "").length
        )
      : ""
  }`

  while (
    texto.match(
      /([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/
    )
  ) {
    texto = texto.replaceAll(
      /([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/g,
      "$1∧$2"
    )
  }

  return texto
}

function sort_variables(texto) {
  // Organiza as variáveis
  let array = []
  for (let item of new Set(
    texto.replaceAll("[Verdadeiro]", "1").replaceAll("[Falso]", "0")
  ))
    array.push(item)

  return array
    .filter(x => {
      return ord(x) > 64 && ord(x) < 91
    })
    .sort()
}

function structure_answer() {
  // Estrutura a resposta
  expression = correct_expression(expression)
  let variaveis = sort_variables(expression)
  let qtde_linhas_tabela = 2 ** variaveis.length
  let bin = "0".repeat(variaveis.length) // Cria uma string de com o valor 0 em binário
  let array_answer_table = {}

  for (let i = 0; i < qtde_linhas_tabela; i++) {
    let valores = {}
    for (let j = 0; j < variaveis.length; j++) {
      valores[variaveis[j]] = bin[j] === "0" ? "1" : "0"

      if (typeof array_answer_table[variaveis[j]] === "undefined") {
        array_answer_table[variaveis[j]] = []
      }
      array_answer_table[variaveis[j]].push(bin[j] === "0" ? "V" : "F") // Converte os valores da string do número binário, 0→V e 1→F para inverter os valores iniciais da tabela.
    }

    resposta = calculate_expression(expression, valores)
    for (let expressao of resposta[1].split("|")) {
      let exp = expressao.split(":")
      if (exp[0] != "" && !is_repeated_var(exp[0], variaveis)) {
        if (typeof array_answer_table[exp[0]] === "undefined") {
          array_answer_table[exp[0]] = []
        }
        array_answer_table[exp[0]].push(exp[1] === "1" ? "V" : "F")
      }
    }
    bin = add_binary(bin, "1") // Adiciona 1 ao valor binário
  }

  build_answer_truth_table(array_answer_table, qtde_linhas_tabela)

  expression_result_array = expression_to_array()

  document.getElementById("table-test").innerHTML = `${expression} é uma 
		${is_tautology(expression_result_array) ? "tautologia" : ""}
		${is_contradiction(expression_result_array) ? "contradição" : ""}
		${is_contigency(expression_result_array) ? "contigência" : ""}
	`

  window.location.href = "#table-test"
}

function expression_to_array() {
  table = document.querySelector("#answer-table")
  array = []
  for (let r of table.rows) {
    lastCell = r.cells[r.cells.length - 1]
    if (lastCell.nodeName === "TD") {
      // if (lastCell.innerHTML === 'F') return false
      array.push(lastCell.innerHTML)
    }
  }
  return array
}

function calculate_inner_expression(exp) {
  while (exp.match(/∼(0|1)/g)) {
    exp = exp.replaceAll(/∼(0|1)/g, (match, p) => {
      //Teste do 'NÃO p'
      return p === "0" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)∧(0|1)/g)) {
    exp = exp.replaceAll(/(0|1)∧(0|1)/g, (match, p, q) => {
      //Teste do 'p E q'
      return p === "1" && q === "1" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)⊻(0|1)/g)) {
    exp = exp.replaceAll(/(0|1)⊻(0|1)/g, (match, p, q) => {
      //Teste do 'OU p OU q'
      return (p === "0" && q === "1") || (p === "1" && q === "0") ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)∨(0|1)/g)) {
    exp = exp.replaceAll(/(0|1)∨(0|1)/g, (match, p, q) => {
      //Teste do 'p OU q'
      return p === "1" || q === "1" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)→(0|1)/g)) {
    exp = exp.replaceAll(/(0|1)→(0|1)/g, (match, p, q) => {
      //Teste do 'SE p ENTÃO q'
      return p === "1" && q === "0" ? "0" : "1"
    })
  }

  while (exp.match(/(0|1)↔(0|1)/g)) {
    exp = exp.replaceAll(/(0|1)↔(0|1)/g, (match, p, q) => {
      //Teste do 'p SE SOMENTE SE q'
      return (p === "1" && q === "1") || (p === "0" && q === "0") ? "1" : "0"
    })
  }

  return exp
}

function calculate_expression(exp, obj, string_result = "") {
  // Calcula a expressão
  let cont = 0
  let exp_dicio = {}
  let result = `(${exp})`

  while (result.match(/\(([^\(\)]*)\)/g)) {
    // arquiva os valores dentro de parenteses em um dicionario
    cont++
    result = result.replace(/\(([^\(\)]*)\)/, (match, p) => {
      //Teste do Parenteses
      exp_dicio[`[P${cont}]`] = {}
      exp_dicio[`[P${cont}]`]["exp"] = p
      return `[P${cont}]`
    })
  }

  for (let inner_exp in exp_dicio) {
    let raw_inner_exp = exp_dicio[inner_exp]["exp"]
    let modified_inner_exp = exp_dicio[inner_exp]["exp"]

    while (raw_inner_exp.match(/(\[P\d+\])/)) {
      raw_inner_exp = raw_inner_exp.replaceAll(/(\[P\d+\])/g, (match, p) => {
        return `(${exp_dicio[p]["exp"]})`
      })
    }

    while (modified_inner_exp.match(/(\[P\d+\])/)) {
      modified_inner_exp = modified_inner_exp.replaceAll(
        /(\[P\d+\])/g,
        (match, p) => {
          return exp_dicio[p]["value"]
        }
      )
    }

    modified_inner_exp = modified_inner_exp
      .replaceAll("[Verdadeiro]", "1")
      .replaceAll("[Falso]", "0")

    for (let variable in obj) {
      //Troca variaveis por seus valores
      modified_inner_exp = modified_inner_exp.replaceAll(
        variable,
        obj[variable]
      )
    }

    exp_dicio[inner_exp]["value"] =
      calculate_inner_expression(modified_inner_exp)
    string_result = `${string_result}|${raw_inner_exp}:${exp_dicio[inner_exp]["value"]}`
  }

  return [result, string_result]
}

function build_answer_truth_table(obj, qtde_linhas) {
  clear_result() //Limpa os resultados anteriores

  let table = document.createElement("table") // Cria uma nova tabela que exibirá os resultados
  table.classList.add("table")
  table.classList.add("table-striped")
  if (darkMode) {
    table.classList.add("table-dark")
  } else {
    table.classList.add("table-light")
  }

  table.id = "answer-table"

  let thead = table.createTHead() // Cria o cabeçalho da tabela

  {
    //Título da tabela
    let row = thead.insertRow() // Cria a linha do cabeçalho do título
    let th = document.createElement("th")
    th.innerHTML = "Tabela-Verdade"
    th.colSpan = Object.keys(obj).length
    row.appendChild(th)
  }

  let row = thead.insertRow() // Cria a linha do cabeçalho com as variáveis

  for (let header in obj) {
    // Preenche o cabeçalho
    let th = document.createElement("th")
    th.innerHTML = header
    row.appendChild(th)
  }

  table.appendChild(thead)

  let tbody = table.createTBody() // Cria o corpo da tabela-verdade
  tbody.classList.add("table-group-divider")

  for (let i = 0; i < qtde_linhas; i++) {
    let row = tbody.insertRow()
    for (let header in obj) {
      let td = document.createElement("td")
      td.innerHTML = obj[header][i]
      row.appendChild(td)
    }
  }

  table.appendChild(tbody)

  document.querySelector("#result").appendChild(table)
}

function add_binary(a, b) {
  var i = a.length - 1
  var j = b.length - 1
  var carry = 0
  var result = ""
  while (i >= 0 || j >= 0) {
    var m = i < 0 ? 0 : a[i] | 0
    var n = j < 0 ? 0 : b[j] | 0
    carry += m + n // soma de dois dígitos
    result = (carry % 2) + result // concatena a string
    carry = (carry / 2) | 0 // remove os decimais,  1 / 2 = 0.5, pega apenas o 0
    i--
    j--
  }
  if (carry !== 0) {
    result = carry + result
  }
  return result
}

// ===== Tema ======================================================================================

// Valor padrão do display
$("#display").val("")

const ELEMENTS = [
  " body",
  ".navbar",
  ".calculator",
  "form",
  "form input",
  ".operand-group",
  ".operator-group",
  "#true",
  "#false",
  "#equal",
  "#clear",
  "#backspace",
  "#table-test",
  " p",
  " hr",
]
