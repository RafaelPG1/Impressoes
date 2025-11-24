// Configuração do quiz de Inglês
const originalQuizData = [
  {
    subject: "Aula 9: Comparativos, Superlativos e Imperativo",
    questions: [
      {
        question: "Em qual situação usamos o comparativo em inglês?",
        options: [
          "Para indicar a característica extrema dentro de um grupo.",
          "Para comparar dois elementos entre si.",
          "Para dar instruções diretamente.",
          "Para expressar ações futuras."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Para comparar dois elementos entre si. O comparativo é usado quando fazemos comparações entre duas coisas, pessoas ou situações (ex: taller, more expensive)."
      },
      {
        question: "Qual alternativa apresenta um comparativo formado corretamente segundo as regras?",
        options: [
          "more tall",
          "talliest",
          "taller",
          "most tall"
        ],
        answer: 2,
        feedback: "Resposta correta: C) taller. Para adjetivos curtos (uma ou duas sílabas), adiciona-se -er para formar o comparativo (tall → taller)."
      },
      {
        question: "Qual adjetivo a seguir é irregular e não segue a regra -er / -est?",
        options: [
          "big",
          "sad",
          "good",
          "happy"
        ],
        answer: 2,
        feedback: "Resposta correta: C) good. 'Good' é um adjetivo irregular: good → better → best. Não segue a regra padrão de adicionar -er/-est."
      },
      {
        question: "Qual frase usa corretamente o superlativo?",
        options: [
          "This computer is more fast than yours.",
          "My phone is the most expensive.",
          "This book is expensiver than that one.",
          "She is more tallest in the class."
        ],
        answer: 1,
        feedback: "Resposta correta: B) My phone is the most expensive. O superlativo de 'expensive' é formado com 'the most' + adjetivo, indicando o grau máximo dentro de um grupo."
      },
      {
        question: "Qual frase apresenta o imperativo corretamente?",
        options: [
          "You to close the door.",
          "Don't forgetting the keys.",
          "Close the door, please.",
          "You close the door."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Close the door, please. O imperativo em inglês usa o verbo no infinitivo sem 'to' e sem sujeito explícito para dar ordens ou instruções."
      }
    ]
  },
  {
    subject: "Aula 10: Partes do Discurso e Phrasal Verbs",
    questions: [
      {
        question: "Qual das opções apresenta CORRETAMENTE um substantivo (noun)?",
        options: [
          "quickly",
          "dog",
          "under",
          "but"
        ],
        answer: 1,
        feedback: "Resposta correta: B) dog. 'Dog' é um substantivo (nome de um animal). 'Quickly' é advérbio, 'under' é preposição e 'but' é conjunção."
      },
      {
        question: "Qual das alternativas apresenta um phrasal verb e seu significado correto?",
        options: [
          "get away – acordar cedo",
          "turn on – desligar",
          "give up – desistir",
          "fall for – procurar"
        ],
        answer: 2,
        feedback: "Resposta correta: C) give up – desistir. Este é um phrasal verb comum que significa desistir ou abandonar algo (ex: 'Don't give up!')."
      },
      {
        question: "Qual opção contém um advérbio (adverb)?",
        options: [
          "teacher",
          "silently",
          "happy",
          "they"
        ],
        answer: 1,
        feedback: "Resposta correta: B) silently. Advérbios geralmente terminam em -ly e modificam verbos, adjetivos ou outros advérbios, indicando modo, tempo, lugar, etc."
      },
      {
        question: "Qual frase usa um phrasal verb separável corretamente?",
        options: [
          "She looked the word up in the dictionary.",
          "He turned off the TV it.",
          "They fell for a new car.",
          "She gave back me the keys."
        ],
        answer: 0,
        feedback: "Resposta correta: A) She looked the word up in the dictionary. Em phrasal verbs separáveis, o objeto pode vir entre o verbo e a partícula (look up = procurar)."
      },
      {
        question: "'Take off' é um phrasal verb:",
        options: [
          "transitivo separável",
          "intransitivo (inseparável)",
          "verbo irregular",
          "pronome possessivo"
        ],
        answer: 1,
        feedback: "Resposta correta: B) intransitivo (inseparável). 'Take off' pode ser intransitivo quando significa 'decolar' (The plane took off) ou transitivo separável quando significa 'tirar' (Take off your shoes)."
      }
    ]
  },
  {
    subject: "Aula 11: Tecnologia e Globalização",
    questions: [
      {
        question: "Skimming é usado para:",
        options: [
          "Encontrar detalhes exatos.",
          "Analisar profundamente cada parágrafo.",
          "Obter visão geral do texto.",
          "Traduzir palavra por palavra."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Obter visão geral do texto. Skimming é a técnica de leitura rápida para captar a ideia principal sem se preocupar com detalhes."
      },
      {
        question: "Scanning é útil quando o leitor precisa:",
        options: [
          "Descobrir a ideia central.",
          "Focar apenas nos cognatos.",
          "Interpretar imagens do texto.",
          "Buscar informação específica."
        ],
        answer: 3,
        feedback: "Resposta correta: D) Buscar informação específica. Scanning é usado para localizar rapidamente informações específicas como datas, nomes ou números no texto."
      },
      {
        question: "Qual das palavras abaixo é um falso cognato?",
        options: [
          "technology",
          "fabric",
          "family",
          "global"
        ],
        answer: 1,
        feedback: "Resposta correta: B) fabric. 'Fabric' significa tecido em inglês, não fábrica (factory). É um falso cognato comum que pode causar confusão."
      },
      {
        question: "Segundo o módulo, quem criou o primeiro computador digital do mundo?",
        options: [
          "Steve Jobs",
          "Charles Babbage",
          "Konrad Zuse",
          "Alan Turing"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Konrad Zuse. O engenheiro alemão Konrad Zuse criou o primeiro computador digital do mundo em 1941."
      },
      {
        question: "O que marcou o ano de 1958 na história dos computadores?",
        options: [
          "Criação do DRAM",
          "Criação do mouse e da interface gráfica",
          "Início da internet",
          "Descoberta do circuito integrado (chip)"
        ],
        answer: 3,
        feedback: "Resposta correta: D) Descoberta do circuito integrado (chip). Em 1958 foi descoberto o circuito integrado, também conhecido como chip de computador, revolucionando a tecnologia."
      }
    ]
  },
  {
    subject: "Aula 12: Vocabulário Técnico (Tecnologia e Globalização)",
    questions: [
      {
        question: "O que são cognatos?",
        options: [
          "Palavras iguais, mas com pronúncia incompreensível.",
          "Palavras semelhantes em grafia e com significado igual.",
          "Palavras inventadas para facilitar leitura.",
          "Palavras técnicas exclusivas da informática."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Palavras semelhantes em grafia e com significado igual. Cognatos são palavras que têm origem comum e significados semelhantes em diferentes idiomas (ex: technology/tecnologia)."
      },
      {
        question: "Qual é um exemplo de falso cognato?",
        options: [
          "family = família",
          "technology = tecnologia",
          "actual = real",
          "important = importante"
        ],
        answer: 2,
        feedback: "Resposta correta: C) actual = real. 'Actual' significa real ou verdadeiro, não 'atual' (current). É um falso cognato clássico entre inglês e português."
      },
      {
        question: "'Scanning' é uma estratégia usada para:",
        options: [
          "Identificar apenas o título.",
          "Examinar imagens e gráficos.",
          "Buscar informações específicas no texto.",
          "Traduzir o texto inteiro palavra por palavra."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Buscar informações específicas no texto. Scanning é a técnica de varredura rápida do texto para localizar informações pontuais."
      },
      {
        question: "'Skimming' é usado para:",
        options: [
          "Análise gramatical do texto.",
          "Obter uma visão geral do conteúdo.",
          "Enfatizar verbos no imperativo.",
          "Traduzir termos técnicos da informática."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Obter uma visão geral do conteúdo. Skimming permite captar rapidamente a essência do texto sem leitura detalhada."
      },
      {
        question: "Qual dos elementos abaixo NÃO é usado em skimming segundo o módulo?",
        options: [
          "Título e subtítulo",
          "Primeira e última frase dos parágrafos",
          "Leitura palavra por palavra",
          "Figuras e gráficos"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Leitura palavra por palavra. O skimming é justamente o oposto da leitura palavra por palavra - busca uma visão geral rápida do texto."
      }
    ]
  },
  {
    subject: "Aula 13: Estratégias de Leitura (Skimming e Scanning)",
    questions: [
      {
        question: "O objetivo principal do skimming é:",
        options: [
          "Encontrar datas específicas.",
          "Traduzir todas as palavras.",
          "Captar a ideia geral do texto.",
          "Memorizar termos técnicos."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Captar a ideia geral do texto. Skimming foca em obter rapidamente uma compreensão geral do conteúdo sem se prender a detalhes."
      },
      {
        question: "O scanning é útil quando o leitor precisa:",
        options: [
          "Ler rapidamente sem atenção aos detalhes.",
          "Identificar o tema principal.",
          "Encontrar nomes, números e dados exatos.",
          "Observar imagens apenas."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Encontrar nomes, números e dados exatos. Scanning é perfeito para localizar informações específicas como datas, nomes próprios, valores, etc."
      },
      {
        question: "Um bom exemplo de uso real do scanning seria:",
        options: [
          "Ler um romance inteiro.",
          "Procurar um nome em uma lista de presença.",
          "Ler o resumo de um artigo acadêmico.",
          "Buscar o significado de uma metáfora."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Procurar um nome em uma lista de presença. Este é um exemplo prático de scanning - varrer rapidamente uma lista procurando por uma informação específica."
      },
      {
        question: "No skimming, o leitor deve observar principalmente:",
        options: [
          "Verbos irregulares",
          "Conjunções",
          "Título, estrutura e cognatos",
          "Quadros numéricos apenas"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Título, estrutura e cognatos. Estes elementos ajudam a captar rapidamente a ideia principal do texto durante o skimming."
      },
      {
        question: "Durante o scanning, qual das ações abaixo é INCORRETA?",
        options: [
          "Procurar informações específicas",
          "Ler apenas trechos necessários",
          "Analisar cada frase profundamente",
          "Ignorar partes irrelevantes"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Analisar cada frase profundamente. No scanning, não se analisa cada frase detalhadamente - apenas se localiza rapidamente a informação desejada."
      }
    ]
  },
  {
    subject: "Aula 14: Estruturas Gramaticais e Marcadores Textuais",
    questions: [
      {
        question: "Qual a função principal dos discourse markers?",
        options: [
          "Formar perguntas diretas",
          "Conectar ideias e organizar o texto",
          "Alterar o tempo verbal",
          "Substituir substantivos"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Conectar ideias e organizar o texto. Discourse markers (marcadores discursivos) são palavras ou expressões que conectam ideias e dão coesão ao texto."
      },
      {
        question: "Qual dos seguintes é um marcador usado para contraste?",
        options: [
          "therefore",
          "however",
          "in addition",
          "first"
        ],
        answer: 1,
        feedback: "Resposta correta: B) however. 'However' (porém, no entanto) é usado para introduzir contraste ou oposição entre ideias."
      },
      {
        question: "'In addition' indica:",
        options: [
          "Contraste",
          "Consequência",
          "Adição de ideias",
          "Explicação"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Adição de ideias. 'In addition' (além disso) é usado para adicionar informações ou argumentos que complementam o que foi dito."
      },
      {
        question: "Marcadores como 'first, second, finally' são usados para:",
        options: [
          "Organizar sequência",
          "Exprimir opinião",
          "Mostrar causa",
          "Indicar oposição"
        ],
        answer: 0,
        feedback: "Resposta correta: A) Organizar sequência. Estes marcadores (primeiro, segundo, finalmente) organizam ideias em ordem sequencial ou cronológica."
      },
      {
        question: "Qual marcador abaixo expressa causa e efeito?",
        options: [
          "although",
          "because",
          "but",
          "even though"
        ],
        answer: 1,
        feedback: "Resposta correta: B) because. 'Because' (porque) estabelece relação de causa e efeito entre duas ideias ou eventos."
      }
    ]
  },
  {
    subject: "Aula 15: Interpretação - History of Computers",
    questions: [
      {
        question: "Quem criou o primeiro computador digital do mundo?",
        options: [
          "Alan Turing",
          "Bill Gates",
          "Konrad Zuse",
          "Tim Berners-Lee"
        ],
        answer: 2,
        feedback: "Resposta correta: C) Konrad Zuse. O engenheiro alemão Konrad Zuse desenvolveu o primeiro computador digital funcional do mundo em 1941, o Z3."
      },
      {
        question: "Em que ano os computadores modernos ganharam mouse + interface gráfica?",
        options: [
          "1939",
          "1968",
          "1958",
          "1984"
        ],
        answer: 1,
        feedback: "Resposta correta: B) 1968. Em 1968 foi apresentado o protótipo de um computador moderno com mouse e interface gráfica (GUI) em uma conferência em São Francisco."
      },
      {
        question: "O circuito integrado (chip) foi descoberto em:",
        options: [
          "1941",
          "1980",
          "1958",
          "1970"
        ],
        answer: 2,
        feedback: "Resposta correta: C) 1958. A descoberta do circuito integrado (chip de computador) em 1958 foi um marco fundamental na evolução da tecnologia computacional."
      },
      {
        question: "A criação do DRAM ocorreu em:",
        options: [
          "1970",
          "1821",
          "1999",
          "1941"
        ],
        answer: 0,
        feedback: "Resposta correta: A) 1970. O primeiro chip DRAM (Dynamic Random Access Memory) foi criado em 1970, revolucionando a memória de computadores."
      },
      {
        question: "Qual período é citado como marco inicial da teoria dos computadores?",
        options: [
          "Década de 1980",
          "Século XIX",
          "2010",
          "1600"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Século XIX. O século XIX marca o início da teoria dos computadores com pioneiros como Charles Babbage e Ada Lovelace."
      }
    ]
  }
];

// Variáveis do quiz
let quizData = []; // Dados embaralhados do quiz
let userAnswers = [];
let quizSubmitted = false;

// Elementos do DOM
const quizContainer = document.getElementById("quiz-container");
const submitButton = document.getElementById("submit");
const restartButton = document.getElementById("restart");
const resultsContainer = document.getElementById("results");

// Função para embaralhar array usando Fisher-Yates shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Função para criar dados do quiz com opções embaralhadas
function createShuffledQuizData() {
    return originalQuizData.map(subject => ({
        ...subject,
        questions: subject.questions.map(question => {
            // Cria array com índices das opções
            const optionIndices = question.options.map((_, index) => index);
            const shuffledIndices = shuffleArray(optionIndices);
            
            // Reorganiza as opções baseado nos índices embaralhados
            const shuffledOptions = shuffledIndices.map(index => question.options[index]);
            
            // Encontra novo índice da resposta correta
            const newCorrectAnswer = shuffledIndices.indexOf(question.answer);
            
            // Cria feedback com letra da resposta correta
            const correctLetter = String.fromCharCode(65 + newCorrectAnswer);
            const originalCorrectOption = question.options[question.answer];
            const newFeedback = `Resposta correta: ${correctLetter}) ${originalCorrectOption}. ${question.feedback}`;
            
            return {
                ...question,
                options: shuffledOptions,
                answer: newCorrectAnswer,
                feedback: newFeedback
            };
        })
    }));
}

// Inicializa o quiz SEM embaralhar (mantém ordem após F5)
function initializeQuiz() {
    userAnswers = [];
    quizSubmitted = false;

    // Tenta carregar dados embaralhados do sessionStorage
    const savedQuizData = sessionStorage.getItem('shuffledQuizData');
    
    if (savedQuizData) {
        // Se existem dados salvos, usa eles (mantém ordem após F5)
        quizData = JSON.parse(savedQuizData);
    } else {
        // Se não existem dados salvos, embaralha e salva
        quizData = createShuffledQuizData();
        sessionStorage.setItem('shuffledQuizData', JSON.stringify(quizData));
    }

    // Cria array plano de todas as questões
    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });

    // Inicializa array de respostas
    userAnswers = new Array(allQuestions.length).fill(null);

    // Mostra todas as questões
    showAllQuestions();
}

// Mostra todas as questões agrupadas por assunto
function showAllQuestions() {
    let questionsHTML = "";
    let questionIndex = 0;

    quizData.forEach((subject) => {
        questionsHTML += `<div class="subject-title">${subject.subject}</div>`;

        subject.questions.forEach((question, qIndex) => {
            questionsHTML += `
                <div class="question-container">
                    <div class="question-number">Questão ${questionIndex + 1}</div>
                    <div class="question-text">${question.question}</div>
                    ${question.image ? `<div class="question-image"><img src="${question.image}" alt="Imagem da questão" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 6px;"></div>` : ''}
                    ${question.questionContinuation ? `<div class="question-text">${question.questionContinuation}</div>` : ''}
                    <div class="options">
                        ${question.options
                          .map((option, optionIndex) => {
                            let optionClass = "option";
                            if (userAnswers[questionIndex] === optionIndex) {
                              optionClass += " selected";
                            }
                            if (quizSubmitted) {
                              if (optionIndex === question.answer) {
                                optionClass += " correct";
                              } else if (
                                userAnswers[questionIndex] === optionIndex &&
                                userAnswers[questionIndex] !== question.answer
                              ) {
                                optionClass += " incorrect";
                              }
                            }
                            return `<div class="${optionClass}" onclick="selectOption(${questionIndex}, ${optionIndex})">${String.fromCharCode(
                              65 + optionIndex
                            )}) ${option}</div>`;
                          })
                          .join("")}
                    </div>
                    ${
                      quizSubmitted
                        ? `
                        <div class="feedback ${
                          userAnswers[questionIndex] === question.answer
                            ? "correct-feedback"
                            : "incorrect-feedback"
                        }">
                            ${question.feedback}
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
            questionIndex++;
        });
    });

    quizContainer.innerHTML = questionsHTML;
}

// Seleciona uma opção
window.selectOption = function (questionIndex, optionIndex) {
    if (!quizSubmitted) {
        userAnswers[questionIndex] = optionIndex;
        showAllQuestions();
    }
};

// Função de scroll suave
function smoothScrollToTop() {
    const duration = 800;
    const start = window.pageYOffset;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const ease = progress * (2 - progress);
        
        window.scrollTo(0, start * (1 - ease));
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }
    
    requestAnimationFrame(animateScroll);
}

// Mostrar notificação de alerta
function showAlertNotification(message) {
    const alertNotification = document.createElement('div');
    alertNotification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        background: linear-gradient(135deg, #f53823ff 0%, #e74c3c 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transition: all 0.4s ease;
    `;
    alertNotification.textContent = message;

    document.body.appendChild(alertNotification);

    setTimeout(() => {
        alertNotification.style.opacity = '1';
        alertNotification.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    setTimeout(() => {
        alertNotification.style.opacity = '0';
        alertNotification.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
            if (alertNotification.parentNode) {
                alertNotification.parentNode.removeChild(alertNotification);
            }
        }, 400);
    }, 5000);
}

function showResults() {
    const firstUnansweredIndex = userAnswers.findIndex(answer => answer === null);

    if (firstUnansweredIndex !== -1) {
        const questionContainers = document.querySelectorAll('.question-container');
        const targetQuestion = questionContainers[firstUnansweredIndex];

        if (targetQuestion) {
            targetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        showAlertNotification("⚠️ Por favor, responda todas as questões antes de enviar.");
        return;
    }

    quizSubmitted = true;
    showAllQuestions();

    const clearButton = document.getElementById('clear');
    if (clearButton) {
        clearButton.disabled = true;
        clearButton.style.opacity = '0.5';
        clearButton.style.cursor = 'not-allowed';
    }

    let score = 0;
    let questionIndex = 0;

    quizData.forEach((subject) => {
        subject.questions.forEach((question) => {
            if (userAnswers[questionIndex] === question.answer) {
                score++;
            }
            questionIndex++;
        });
    });

    const totalQuestions = questionIndex;
    const percentage = Math.round((score / totalQuestions) * 100);

    resultsContainer.innerHTML = `
        <h2>Resultado</h2>
        <div class="score">Você acertou ${score} de ${totalQuestions} questões</div>
        <div class="percentage">${percentage}%</div>
        <p>${
          percentage >= 70
            ? "Parabéns! Excelente desempenho."
            : "Revise os conceitos para melhorar seu desempenho."
        }</p>
    `;
    resultsContainer.style.display = "block";
    submitButton.style.display = "none";
    restartButton.style.display = "inline-block";
}

// Reinicia o quiz com novas opções embaralhadas
function restartQuiz() {
    userAnswers = [];
    quizSubmitted = false;

    // Cria novos dados embaralhados e salva no sessionStorage
    quizData = createShuffledQuizData();
    sessionStorage.setItem('shuffledQuizData', JSON.stringify(quizData));

    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });
    userAnswers = new Array(allQuestions.length).fill(null);

    showAllQuestions();
    resultsContainer.style.display = "none";
    submitButton.style.display = "inline-block";
    restartButton.style.display = "none";

    const clearButton = document.getElementById('clear');
    if (clearButton) {
        clearButton.disabled = false;
        clearButton.style.opacity = '1';
        clearButton.style.cursor = 'pointer';
    }

    const revealButton = document.getElementById('reveal');
    if (revealButton) {
        revealButton.disabled = false;
        revealButton.style.opacity = '1';
        revealButton.style.cursor = 'pointer';
    }

    smoothScrollToTop();
}

// Seleciona botão LIMPAR
const clearButton = document.getElementById('clear');

// Função para limpar respostas SEM embaralhar novamente
function clearAnswers() {
    if (clearButton && clearButton.disabled) {
        return;
    }

    // Limpa todas as respostas do usuário
    userAnswers.fill(null);

    // Desmarca todos os inputs de radio/checkbox
    const respostas = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    respostas.forEach(input => {
        input.checked = false;
    });

    // Atualiza a interface das questões
    showAllQuestions();

    // Se estava mostrando resultados, esconde
    resultsContainer.style.display = "none";

    // Mostra botão de enviar
    submitButton.style.display = "inline-block";

    // Esconde botão de reiniciar
    restartButton.style.display = "none";

    // Scroll suave para o topo
    smoothScrollToTop();
}

// Seleciona o botão revelar
const revealButton = document.getElementById('reveal');

// Função para revelar todas as respostas
function revealAnswers() {
    // Marca como enviado temporariamente para mostrar respostas
    quizSubmitted = true;
    
    // Preenche userAnswers com as respostas corretas para mostrar os feedbacks
    userAnswers = quizData.flatMap(subject => subject.questions.map(q => q.answer));
    
    // Reutiliza função para renderizar questões com respostas corretas
    showAllQuestions();
    
    // Esconde botão de enviar
    submitButton.style.display = "none";
    
    // Desabilita botões limpar e revelar
    clearButton.disabled = true;
    clearButton.style.opacity = '0.5';
    clearButton.style.cursor = 'not-allowed';
    
    revealButton.disabled = true;
    revealButton.style.opacity = '0.5';
    revealButton.style.cursor = 'not-allowed';
    
    // Mostra botão de reiniciar
    restartButton.style.display = "inline-block";
    
    // Scroll suave para o topo
    smoothScrollToTop();
}

// Adiciona evento ao botão revelar (se existir)
if (revealButton) {
    revealButton.addEventListener('click', revealAnswers);
}

// Adiciona evento ao botão limpar
if (clearButton) {
    clearButton.addEventListener('click', clearAnswers);
}

// Event listeners
submitButton.addEventListener("click", showResults);
restartButton.addEventListener("click", restartQuiz);

// Inicializa o quiz quando a página carrega
document.addEventListener("DOMContentLoaded", initializeQuiz);





/**
 * CÓDIGO DE INTEGRAÇÃO PARA QUIZZES EXISTENTES
 * ===========================================
 * 
 * Este código deve ser colocado NO FINAL dos arquivos JavaScript dos quizzes
 * existentes, APÓS todas as funções originais.
 * 
 * ⚠️ IMPORTANTE: 
 * - Adicione a tag <script src="../storage.js"></script> no HTML do quiz
 * - Defina a variável QUIZ_ID no início deste código para cada quiz
 * - Não modifique nenhuma função original do quiz
 */

// =============================================================================
// CONFIGURAÇÃO - ALTERE APENAS ESTA LINHA PARA CADA QUIZ
// =============================================================================

const QUIZ_ID = 'Questoes_ingles_2'; // ← ALTERE PARA CADA QUIZ (ex: 'matematica_unidade2', 'historia_capitulo1', etc.)

// =============================================================================
// SISTEMA DE AUTO-SAVE E RESTORE - NÃO MODIFICAR
// =============================================================================

/**
 * CONFIGURAÇÕES DO AUTO-SAVE
 */
const AUTO_SAVE_CONFIG = {
    enabled: true,           // Auto-save ativado
    interval: 10000,        // Salva a cada 10 segundos (10000ms)
    saveOnAnswer: true,     // Salva imediatamente ao responder uma questão
    clearOnSubmit: false    // NÃO limpa ao enviar (mantém para revisão)
};

/**
 * VARIÁVEIS DE CONTROLE DO STORAGE
 */
let autoSaveInterval = null;
let storageInitialized = false;

/**
 * INICIALIZAR SISTEMA DE STORAGE
 */
function initializeStorage() {
    // Verifica se o storage está disponível
    if (typeof storage === 'undefined') {
        console.warn('[Quiz Storage] storage.js não foi carregado. Funcionalidade de auto-save desabilitada.');
        return false;
    }

    if (!storage.isStorageAvailable()) {
        console.warn('[Quiz Storage] localStorage não disponível. Progresso não será salvo.');
        return false;
    }

    storageInitialized = true;
    console.log(`[Quiz Storage] Sistema inicializado para quiz: ${QUIZ_ID}`);
    
    // Carrega progresso salvo
    loadSavedProgress();
    
    // Inicia auto-save se configurado
    if (AUTO_SAVE_CONFIG.enabled) {
        startAutoSave();
    }
    
    return true;
}

/**
 * CARREGAR PROGRESSO SALVO
 */
function loadSavedProgress() {
    if (!storageInitialized) return;
    
    try {
        const savedProgress = storage.loadProgress(QUIZ_ID);
        
        if (savedProgress && savedProgress.respostas) {
            // Verifica se realmente há respostas salvas (não apenas array vazio)
            const hasAnswers = savedProgress.respostas.some(answer => answer !== null && answer !== undefined);
            
            if (hasAnswers) {
                // Restaura as respostas do usuário
                userAnswers = [...savedProgress.respostas];
                
                // Atualiza a interface
                if (typeof showAllQuestions === 'function') {
                    showAllQuestions();
                }
                
                // Mostra notificação APENAS se houver progresso real
                const answeredCount = savedProgress.respostas.filter(answer => answer !== null && answer !== undefined).length;
                showProgressNotification(`Progresso anterior restaurado! 📚 (${answeredCount} questões respondidas)`);
                
                console.log(`[Quiz Storage] Progresso restaurado para ${QUIZ_ID}:`, savedProgress);
            } else {
                console.log(`[Quiz Storage] Progresso encontrado mas sem respostas para ${QUIZ_ID}`);
            }
        } else {
            console.log(`[Quiz Storage] Nenhum progresso salvo encontrado para ${QUIZ_ID}`);
        }
        
    } catch (error) {
        console.error('[Quiz Storage] Erro ao carregar progresso:', error);
    }
}

/**
 * SALVAR PROGRESSO ATUAL
 */
function saveCurrentProgress() {
    if (!storageInitialized || !userAnswers) return;
    
    try {
        // Metadata adicional
        const metadata = {
            totalQuestions: userAnswers.length,
            answeredCount: userAnswers.filter(answer => answer !== null).length,
            isCompleted: quizSubmitted || false,
            userAgent: navigator.userAgent
        };
        
        // Salva no storage
        const saved = storage.saveProgress(QUIZ_ID, userAnswers, metadata);
        
        if (saved) {
            console.log(`[Quiz Storage] Progresso salvo automaticamente para ${QUIZ_ID}`);
        }
        
    } catch (error) {
        console.error('[Quiz Storage] Erro ao salvar progresso:', error);
    }
}

/**
 * INICIAR AUTO-SAVE PERIÓDICO
 */
function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    autoSaveInterval = setInterval(() => {
        saveCurrentProgress();
    }, AUTO_SAVE_CONFIG.interval);
    
    console.log(`[Quiz Storage] Auto-save iniciado (intervalo: ${AUTO_SAVE_CONFIG.interval}ms)`);
}

/**
 * PARAR AUTO-SAVE
 */
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('[Quiz Storage] Auto-save pausado');
    }
}

/**
 * MOSTRAR NOTIFICAÇÃO DE PROGRESSO
 */
function showProgressNotification(message) {
    // Cria elemento de notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    // Adiciona ao DOM
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove após 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

/**
 * SOBRESCREVER FUNÇÃO selectOption PARA AUTO-SAVE
 */
if (typeof window.selectOption === 'function') {
    const originalSelectOption = window.selectOption;
    
    window.selectOption = function(questionIndex, optionIndex) {
        // Chama função original
        originalSelectOption(questionIndex, optionIndex);
        
        // Auto-save se configurado
        if (AUTO_SAVE_CONFIG.saveOnAnswer && storageInitialized) {
            setTimeout(() => {
                saveCurrentProgress();
            }, 100); // Pequeno delay para garantir que userAnswers foi atualizado
        }
    };
}

/**
 * SOBRESCREVER FUNÇÃO showResults PARA CONTROLE DE STORAGE
 */
if (typeof showResults === 'function') {
    const originalShowResults = showResults;
    
    window.showResults = function() {
        // Para o auto-save
        stopAutoSave();
        
        // Chama função original
        originalShowResults();
        
        // Salva resultado final
        if (storageInitialized) {
            setTimeout(() => {
                const finalMetadata = {
                    completed: true,
                    completedAt: new Date().toISOString(),
                    finalScore: calculateFinalScore()
                };
                
                storage.saveProgress(QUIZ_ID, userAnswers, finalMetadata);
                
                // Mostra opção de limpar progresso
                addClearProgressButton();
                
            }, 500);
        }
    };
}

/**
 * SOBRESCREVER FUNÇÃO restartQuiz PARA LIMPAR STORAGE
 */
if (typeof restartQuiz === 'function') {
    const originalRestartQuiz = restartQuiz;
    
    window.restartQuiz = function() {
        // Limpa progresso salvo
        if (storageInitialized) {
            storage.clearProgress(QUIZ_ID);
            console.log(`[Quiz Storage] Progresso limpo para ${QUIZ_ID}`);
        }
        
        // Chama função original
        originalRestartQuiz();
        
        // Reinicia auto-save
        if (AUTO_SAVE_CONFIG.enabled && storageInitialized) {
            startAutoSave();
        }
    };
}

/**
 * CALCULAR PONTUAÇÃO FINAL
 */
function calculateFinalScore() {
    if (!userAnswers || !quizData) return 0;
    
    let score = 0;
    let questionIndex = 0;
    
    quizData.forEach((subject) => {
        subject.questions.forEach((question) => {
            if (userAnswers[questionIndex] === question.answer) {
                score++;
            }
            questionIndex++;
        });
    });
    
    return score;
}

/**
 * ADICIONAR BOTÃO DE LIMPAR PROGRESSO
 */
function addClearProgressButton() {
    // Verifica se já existe
    if (document.getElementById('clearProgressBtn')) return;
    
    // Cria botão
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearProgressBtn';
    clearBtn.innerHTML = '🗑️ Limpar Progresso Salvo';
    clearBtn.style.cssText = `
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
        transition: background 0.3s ease;
    `;
    
    clearBtn.onmouseover = () => clearBtn.style.background = '#c82333';
    clearBtn.onmouseout = () => clearBtn.style.background = '#dc3545';
    
    clearBtn.onclick = function() {
        if (confirm('Deseja realmente limpar o progresso salvo deste quiz?')) {
            storage.clearProgress(QUIZ_ID);
            showProgressNotification('Progresso limpo! 🗑️');
            clearBtn.remove();
        }
    };
    
    // Adiciona ao container de resultados
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
        resultsContainer.appendChild(clearBtn);
    }
}

/**
 * CONTROLE DE VISIBILIDADE DA PÁGINA (para pausar auto-save)
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Salva ao sair da página
        saveCurrentProgress();
        stopAutoSave();
    } else {
        // Reinicia auto-save ao voltar
        if (AUTO_SAVE_CONFIG.enabled && storageInitialized) {
            startAutoSave();
        }
    }
});

/**
 * INICIALIZAÇÃO AUTOMÁTICA
 */
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que tudo foi carregado
    setTimeout(initializeStorage, 500);
});

// Também inicializa se o DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeStorage, 500);
    });
} else {
    setTimeout(initializeStorage, 500);
}

/**
 * SALVAMENTO ANTES DE SAIR DA PÁGINA
 */
window.addEventListener('beforeunload', function() {
    if (storageInitialized) {
        saveCurrentProgress();
    }
});

console.log('[Quiz Integration] Código de integração carregado para quiz:', QUIZ_ID);

// =============================================================================
// FIM DO CÓDIGO DE INTEGRAÇÃO
// =============================================================================

/**
 * INSTRUÇÕES DE USO:
 * 
 * 1. Salve o storage.js na pasta PRINCIPAL do projeto
 * 2. Em cada HTML de quiz, adicione: <script src="../storage.js"></script>
 * 3. Copie este código e cole NO FINAL do JavaScript de cada quiz
 * 4. Altere apenas a linha: const QUIZ_ID = 'seu_quiz_id_unico';
 * 5. Pronto! O quiz terá auto-save automático
 * 
 * FUNCIONALIDADES AUTOMÁTICAS:
 * ✅ Auto-save a cada 10 segundos
 * ✅ Save imediato ao responder questões  
 * ✅ Restaura progresso ao recarregar página
 * ✅ Notificações visuais de progresso
 * ✅ Botão para limpar progresso
 * ✅ Save ao sair da página
 * ✅ Controle inteligente de pausar/resumir save
 */







/**
 * CONTROLE DE VISIBILIDADE DA PÁGINA (para pausar auto-save)
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Salva ao sair da página
        saveCurrentProgress();
        stopAutoSave();
    } else {
        // Reinicia auto-save ao voltar
        if (AUTO_SAVE_CONFIG.enabled && storageInitialized) {
            startAutoSave();
        }
    }
});

/**
 * INICIALIZAÇÃO AUTOMÁTICA
 */
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que tudo foi carregado
    setTimeout(initializeStorage, 500);
});

// Também inicializa se o DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeStorage, 500);
    });
} else {
    setTimeout(initializeStorage, 500);
}

/**
 * SALVAMENTO ANTES DE SAIR DA PÁGINA
 */
window.addEventListener('beforeunload', function() {
    if (storageInitialized) {
        saveCurrentProgress();
    }
});

console.log('[Quiz Integration] Código de integração carregado para quiz:', QUIZ_ID);

// =============================================================================
// FIM DO CÓDIGO DE INTEGRAÇÃO
// =============================================================================

/**
 * INSTRUÇÕES DE USO:
 * 
 * 1. Salve o storage.js na pasta PRINCIPAL do projeto
 * 2. Em cada HTML de quiz, adicione: <script src="../storage.js"></script>
 * 3. Copie este código e cole NO FINAL do JavaScript de cada quiz
 * 4. Altere apenas a linha: const QUIZ_ID = 'seu_quiz_id_unico';
 * 5. Pronto! O quiz terá auto-save automático
 * 
 * FUNCIONALIDADES AUTOMÁTICAS:
 * ✅ Auto-save a cada 10 segundos
 * ✅ Save imediato ao responder questões  
 * ✅ Restaura progresso ao recarregar página
 * ✅ Notificações visuais de progresso
 * ✅ Botão para limpar progresso
 * ✅ Save ao sair da página
 * ✅ Controle inteligente de pausar/resumir save
 */




// Seleciona os botões de navegação
const btnUp = document.getElementById('btn-up');
const btnLeft = document.getElementById('btn-left');
const btnDown = document.getElementById('btn-down');

// Seleciona os botões da barra lateral (usando IDs diferentes dos botões principais)
const clearButtonSidebar = document.getElementById('clearButton');
const submitButtonSidebar = document.getElementById('submitButton');
const revealButtonSidebar = document.getElementById('revealButton');

// Função para scroll suave e lento
function smoothScrollTo(targetPosition, duration = 800) {
    const start = window.scrollY;
    const change = targetPosition - start;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0 a 1
        window.scrollTo(0, start + change * progress);
        if (progress < 1) requestAnimationFrame(animateScroll);
    }

    requestAnimationFrame(animateScroll);
}

// Rola para o topo
btnUp.addEventListener('click', () => {
    smoothScrollTo(0, 1000); // duração em ms (1 segundo)
});

// Volta para a página anterior
btnLeft.addEventListener('click', () => {
    window.location.href = '../english.html';
});

// Rola para o final da página
btnDown.addEventListener('click', () => {
    smoothScrollTo(document.body.scrollHeight, 1000);
});

// Função para atualizar o ícone do botão enviar/reiniciar
function updateSubmitButtonIcon() {
    const icon = submitButtonSidebar.querySelector('i');
    if (quizSubmitted) {
        // Se o quiz foi enviado ou revelado, mostra ícone de reiniciar
        icon.className = 'fas fa-redo';
        submitButtonSidebar.title = 'Reiniciar Quiz';
    } else {
        // Se o quiz não foi enviado, mostra ícone de enviar
        icon.className = 'fas fa-paper-plane';
        submitButtonSidebar.title = 'Enviar Quiz';
    }
}

// Event listeners para os botões da barra lateral
// Limpar respostas (chama a função clearAnswers já existente)
clearButtonSidebar.addEventListener('click', () => {
    clearAnswers();
    updateSubmitButtonIcon(); // Atualiza o ícone após limpar
});

// Botão enviar/reiniciar - função dupla baseada no estado do quiz
submitButtonSidebar.addEventListener('click', () => {
    if (quizSubmitted) {
        // Se já foi enviado/revelado, reinicia o quiz
        restartQuiz();
    } else {
        // Se não foi enviado, envia o quiz
        showResults();
    }
    updateSubmitButtonIcon(); // Atualiza o ícone após a ação
});

// Revelar respostas (chama a função revealAnswers já existente)
revealButtonSidebar.addEventListener('click', () => {
    revealAnswers();
    updateSubmitButtonIcon(); // Atualiza o ícone após revelar
});

// Inicializa o ícone correto quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda um pouco para garantir que as variáveis estejam carregadas
    setTimeout(() => {
        updateSubmitButtonIcon();
    }, 100);
});