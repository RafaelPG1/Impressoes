// Configuração do quiz de Sistemas Operacionais
// Configuração do quiz de Sistemas Operacionais
const originalQuizData = [
  {
    subject: "Memória Virtual",
    questions: [
      {
        question: "Nos sistemas operacionais modernos, a memória virtual permite que programas utilizem mais memória do que a RAM física disponível. Ela cria a ilusão de um espaço de endereçamento maior, utilizando tanto a RAM quanto o disco. Qual das alternativas define corretamente o conceito de memória virtual?",
        options: [
          "É um mecanismo que permite que o sistema operacional execute mais processos ao utilizar parte do disco como extensão da memória RAM.",
          "É um tipo de memória física utilizada pelo processador para armazenar registradores.",
          "É o nome dado ao conjunto de molduras presentes na memória principal.",
          "É um módulo da CPU responsável por realizar a tradução de endereços lógicos em físicos.",
          "É uma técnica que impede a ocorrência de page faults durante a execução dos programas."
        ],
        answer: 0,
        feedback: "Resposta correta: A) É um mecanismo que permite que o sistema operacional execute mais processos ao utilizar parte do disco como extensão da memória RAM. A memória virtual cria a ilusão de um espaço de endereçamento maior, permitindo que o SO execute programas maiores que a RAM física disponível."
      }
    ]
  },
  {
    subject: "Virtual File System (VFS)",
    questions: [
      {
        question: "O Virtual File System (VFS) é uma camada de abstração presente em sistemas operacionais modernos, responsável por padronizar o acesso a diferentes sistemas de arquivos, permitindo que o usuário e os programas manipulem arquivos sem conhecer os detalhes internos de cada implementação. Assinale a alternativa que melhor descreve o VFS:",
        options: [
          "Um sistema de arquivos específico para discos SSD.",
          "Um algoritmo de ordenação de diretórios utilizado apenas em sistemas Linux.",
          "Um módulo que impede mudanças na estrutura de diretórios do sistema.",
          "Uma camada de abstração que unifica o acesso a diferentes sistemas de arquivos.",
          "Um driver responsável por controlar exclusivamente partições EXT4."
        ],
        answer: 3,
        feedback: "Resposta correta: D) Uma camada de abstração que unifica o acesso a diferentes sistemas de arquivos. O VFS permite que diferentes sistemas de arquivos sejam acessados de forma padronizada, abstraindo os detalhes de implementação específicos de cada um."
      }
    ]
  },
  {
    subject: "Tipos de Backup",
    questions: [
      {
        question: "O backup é uma cópia de segurança de dados (como documentos, fotos e arquivos) que serve como forma de proteger os dados contra perda, danos ou falhas, pois possibilita a recuperação dos mesmos. Existem três tipos de backup principais:\n• Completo: copia todos os arquivos selecionados.\n• Incremental: copia apenas os arquivos alterados desde o último backup qualquer (completo ou incremental).\n• Diferencial: copia apenas arquivos alterados desde o último backup completo.\n\nQual alternativa associa corretamente o tipo de backup à sua característica?",
        options: [
          "Backup diferencial: copia os arquivos alterados desde o último backup incremental.",
          "Backup completo: copia apenas os arquivos modificados recentemente.",
          "Backup diferencial: remove automaticamente cópias anteriores.",
          "Backup incremental: copia os arquivos alterados desde o último backup de qualquer tipo.",
          "Backup incremental: repete sempre a cópia total dos arquivos selecionados."
        ],
        answer: 3,
        feedback: "Resposta correta: D) Backup incremental: copia os arquivos alterados desde o último backup de qualquer tipo. O backup incremental é o mais eficiente em termos de espaço e tempo, pois copia apenas as mudanças desde o último backup realizado."
      }
    ]
  },
  {
    subject: "Princípio do Privilégio Mínimo",
    questions: [
      {
        question: "Um dos princípios fundamentais de segurança em sistemas operacionais é o privilégio mínimo, que orienta a concessão de permissões de forma restrita, evitando que usuários e processos tenham mais acesso do que o necessário para suas atividades. Qual alternativa define corretamente o princípio do privilégio mínimo?",
        options: [
          "Criar permissões duplicadas para aumentar a disponibilidade das operações.",
          "Conceder a cada usuário acesso total ao sistema para evitar falhas de autorização.",
          "Garantir que usuários e processos tenham apenas os privilégios estritamente necessários para executar suas tarefas.",
          "Atribuir permissões temporárias até que o sistema confirme a identidade do usuário.",
          "Permitir que usuários utilizem apenas permissões que não afetam o desempenho do sistema."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Garantir que usuários e processos tenham apenas os privilégios estritamente necessários para executar suas tarefas. Este princípio fundamental de segurança minimiza os riscos ao limitar o acesso apenas ao necessário para cada função."
      }
    ]
  },
  {
    subject: "Princípio Conhecer o Necessário",
    questions: [
      {
        question: "Na implantação de mecanismos de proteção e segurança em sistemas operacionais modernos, o princípio 'Conhecer o necessário' complementa o privilégio mínimo ao definir que o acesso à informação deve ser permitido apenas quando essencial ao desempenho da função de um usuário, mesmo quando ele possui privilégios elevados. Assinale qual situação exemplifica corretamente o princípio do Conhecer o necessário:",
        options: [
          "Um processo de backup acessa todos os arquivos e também arquivos temporários criados internamente por outros processos.",
          "Um usuário comum recebe acesso integral ao diretório de outros usuários para facilitar tarefas colaborativas.",
          "Um desenvolvedor tem acesso apenas aos logs do serviço no qual trabalha, e não a logs de outros departamentos.",
          "Todos os usuários recebem as mesmas permissões para evitar inconsistências.",
          "Um administrador de sistema tem acesso automático a todos os arquivos do servidor, independentemente de sua função."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Um desenvolvedor tem acesso apenas aos logs do serviço no qual trabalha, e não a logs de outros departamentos. Este exemplo demonstra o princípio do 'conhecer o necessário', onde o acesso é limitado apenas às informações essenciais para a função específica."
      }
    ]
  },
  {
    subject: "Domínio de Proteção",
    questions: [
      {
        question: "Um domínio de proteção define o conjunto de recursos e operações que um processo ou usuário pode executar. Mudanças de domínio ocorrem quando diferentes permissões são necessárias, como na execução temporária de operações privilegiadas.",
        options: [
          "Verdadeiro",
          "Falso"
        ],
        answer: 0,
        feedback: "Resposta correta: A) Verdadeiro. Domínios de proteção definem os limites de acesso de processos e usuários, e mudanças de domínio são necessárias quando operações com diferentes níveis de privilégio precisam ser executadas."
      }
    ]
  },
  {
    subject: "Containers vs Máquinas Virtuais",
    questions: [
      {
        question: "Containers compartilham o kernel com o sistema hospedeiro, o que traz desempenho superior, mas também menor isolamento. Máquinas virtuais, por outro lado, simulam hardware completo, oferecendo isolamento mais forte. Qual análise descreve corretamente o impacto de segurança ao se comparar containers e máquinas virtuais?",
        options: [
          "Máquinas virtuais são mais vulneráveis a ataques de escalonamento do que containers.",
          "Containers são mais seguros porque não compartilham nenhum recurso com o hospedeiro.",
          "Máquinas virtuais possuem isolamento mais forte, pois cada uma executa seu próprio kernel.",
          "Containers não podem ser monitorados pelo sistema hospedeiro, reduzindo a superfície de ataque.",
          "Containers são sempre mais seguros que VMs, independentemente da configuração."
        ],
        answer: 2,
        feedback: "Resposta correta: C) Máquinas virtuais possuem isolamento mais forte, pois cada uma executa seu próprio kernel. Este isolamento completo do hardware virtualizado oferece maior segurança comparado aos containers, que compartilham o kernel do host."
      }
    ]
  },
  {
    subject: "Paginação de Memória",
    questions: [
      {
        question: "Na técnica de paginação, a memória virtual é dividida em páginas, e a memória RAM é dividida em molduras (frames). O sistema operacional carrega as páginas ativas para molduras disponíveis, permitindo a execução mesmo quando todo o programa não cabe na RAM. Ao dividir a memória virtual em páginas e a memória física em molduras, o sistema operacional alcança qual objetivo?",
        options: [
          "Garantir que todas as páginas estejam sempre simultaneamente carregadas na RAM.",
          "Facilitar o carregamento e descarregamento de partes do processo, reduzindo a necessidade de alocação contígua e permitindo maior flexibilidade de execução.",
          "Eliminar completamente a fragmentação externa e interna.",
          "Organizar a memória de forma a garantir que processos diferentes compartilhem a mesma moldura simultaneamente.",
          "Permitir a alocação contínua de endereços físicos, reduzindo fragmentação interna."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Facilitar o carregamento e descarregamento de partes do processo, reduzindo a necessidade de alocação contígua e permitindo maior flexibilidade de execução. A paginação permite gerenciamento flexível da memória, carregando apenas as partes necessárias do programa."
      }
    ]
  },
  {
    subject: "MMU e TLB",
    questions: [
      {
        question: "Ao acessar um endereço de memória, a CPU envia o endereço lógico à MMU (Memory Management Unit), que consulta a tabela de páginas para encontrar o endereço físico correspondente. Para acelerar o processo, a MMU utiliza a TLB (Translation Lookaside Buffer), uma memória cache de mapeamentos recentes. Durante a execução de um processo, a TLB encontra um mapeamento válido para um endereço lógico solicitado. Nessa situação, qual é o procedimento correto executado pela MMU?",
        options: [
          "A MMU recarrega toda a tabela de páginas para garantir consistência com a TLB.",
          "A MMU gera um page fault por não encontrar o endereço na tabela de páginas.",
          "A MMU ignora a TLB e consulta apenas a tabela de páginas.",
          "A MMU bloqueia a execução até que uma nova moldura seja alocada pelo SO.",
          "A MMU utiliza a entrada da TLB para obter o endereço físico sem acessar a tabela de páginas."
        ],
        answer: 4,
        feedback: "Resposta correta: E) A MMU utiliza a entrada da TLB para obter o endereço físico sem acessar a tabela de páginas. Quando há um TLB hit, a tradução é feita diretamente do cache, evitando o acesso mais lento à tabela de páginas na memória."
      }
    ]
  },
  {
    subject: "Segmentação de Memória",
    questions: [
      {
        question: "Diferentemente da paginação, que divide a memória em blocos de tamanho fixo, a segmentação organiza a memória de acordo com a estrutura lógica do programa, utilizando blocos de tamanhos variáveis chamados segmentos. Qual alternativa define corretamente segmentação em memória virtual?",
        options: [
          "É uma técnica que divide a memória em blocos de tamanho fixo, chamados molduras.",
          "É um método que utiliza somente o disco rígido para armazenar páginas temporárias.",
          "É uma técnica que utiliza a TLB para acelerar traduções de endereços físicos.",
          "É uma técnica que divide os programas em partes lógicas de tamanhos variáveis, como código, pilha e dados.",
          "É um método que permite que todas as partes do programa permaneçam sempre carregadas na RAM."
        ],
        answer: 3,
        feedback: "Resposta correta: D) É uma técnica que divide os programas em partes lógicas de tamanhos variáveis, como código, pilha e dados. A segmentação reflete a estrutura lógica do programa, ao contrário da paginação que usa blocos de tamanho fixo."
      }
    ]
  },
  {
    subject: "Page Fault",
    questions: [
      {
        question: "Um page fault ocorre quando o processo tenta acessar uma página que não está na RAM. O sistema operacional deve então buscar essa página no disco, carregá-la em uma moldura e atualizar a tabela de páginas. Esse evento pode afetar significativamente o desempenho do sistema. Considere um processo que apresenta alta taxa de page faults. Com base no funcionamento da paginação, qual análise é mais coerente?",
        options: [
          "O tamanho da página está excessivamente grande, causando falta de fragmentação externa.",
          "O processo está acessando muitas páginas não residentes na RAM.",
          "O sistema está utilizando exclusivamente páginas compartilhadas entre vários processos.",
          "O SO aumentou a quantidade de molduras disponíveis para o processo, causando maior instabilidade.",
          "A TLB está com todas as entradas válidas, eliminando a necessidade de acessar páginas no disco."
        ],
        answer: 1,
        feedback: "Resposta correta: B) O processo está acessando muitas páginas não residentes na RAM. Alta taxa de page faults indica que o processo frequentemente requisita páginas que não estão carregadas na memória física, resultando em acessos ao disco e degradação de desempenho."
      }
    ]
  },
  {
    subject: "Visões de Arquivos",
    questions: [
      {
        question: "Um arquivo representa uma unidade lógica de armazenamento de dados. Para o usuário, é uma entidade nomeada contendo informações úteis, como documentos ou imagens. Já para o sistema operacional, um arquivo é uma estrutura composta por metadados e blocos de dados armazenados fisicamente. Qual alternativa expressa corretamente a diferença entre a visão do usuário e a visão do sistema operacional sobre um arquivo?",
        options: [
          "Para o usuário, arquivos são armazenados em RAM; para o SO, são armazenados apenas no processador.",
          "Para o usuário, o arquivo é uma sequência de blocos físicos; para o SO, é apenas um nome associado a dados lógicos.",
          "Para o usuário, arquivos são objetos mutáveis; para o SO, são sempre objetos imutáveis.",
          "Para o usuário, o arquivo é uma entidade nomeada com conteúdo; para o SO, é uma estrutura que inclui metadados e a organização física dos blocos.",
          "Para o usuário, o arquivo representa somente sua extensão; para o SO, representa apenas os dados."
        ],
        answer: 3,
        feedback: "Resposta correta: D) Para o usuário, o arquivo é uma entidade nomeada com conteúdo; para o SO, é uma estrutura que inclui metadados e a organização física dos blocos. Esta diferença reflete a abstração que o SO fornece, escondendo detalhes de implementação física do usuário."
      }
    ]
  },
  {
    subject: "Métodos de Acesso a Arquivos",
    questions: [
      {
        question: "Diferentes métodos de acesso a arquivos são adotados pelos sistemas operacionais conforme a estrutura interna dos dados e as necessidades das aplicações:\n• Sequencial: acesso em ordem linear.\n• Direto ou aleatório: permite acessar registros específicos pelo número ou posição.\n• Indexado: utiliza uma estrutura de índice para localizar rapidamente registros em grandes arquivos.\n\nSobre os métodos de acesso a arquivos, analise as assertivas a seguir:\nI - O método de acesso indexado é mais eficiente do que o sequencial para localizar rapidamente registros específicos em arquivos grandes.\nPORQUE\nII - O método indexado utiliza uma tabela auxiliar que associa posições lógicas dos registros aos seus endereços físicos.",
        options: [
          "As afirmações I e II são verdadeiras, e II justifica corretamente I.",
          "As afirmações I e II são verdadeiras, mas II não justifica I.",
          "Ambas são falsas.",
          "I é falsa, e II é verdadeira.",
          "I é verdadeira, e II é falsa."
        ],
        answer: 0,
        feedback: "Resposta correta: A) As afirmações I e II são verdadeiras, e II justifica corretamente I. O método indexado é mais eficiente para buscas específicas justamente porque utiliza uma estrutura de índice que mapeia registros lógicos a endereços físicos, evitando varreduras sequenciais completas."
      }
    ]
  },
  {
    subject: "Caminhos em Sistemas de Arquivos",
    questions: [
      {
        question: "A navegação em sistemas de arquivos pode ocorrer por meio de dois tipos de caminhos:\n• Caminho absoluto: inicia a partir da raiz do sistema de arquivos.\n• Caminho relativo: inicia a partir do diretório atual do usuário.\n\nQual alternativa diferencia corretamente caminho absoluto de caminho relativo?",
        options: [
          "Caminho absoluto sempre aponta para diretórios ocultos, enquanto o relativo aponta apenas para diretórios normais.",
          "Caminho relativo é sempre mais seguro, pois independe do diretório corrente.",
          "Caminho absoluto utiliza nomes de diretórios abreviados, enquanto o relativo usa nomes completos.",
          "Caminho absoluto só pode ser usado em sistemas UNIX, e o relativo apenas em sistemas Windows.",
          "Caminho absoluto parte da raiz do sistema, enquanto o relativo depende da posição atual no diretório onde o usuário está."
        ],
        answer: 4,
        feedback: "Resposta correta: E) Caminho absoluto parte da raiz do sistema, enquanto o relativo depende da posição atual no diretório onde o usuário está. Esta é a diferença fundamental entre os dois tipos de caminhos na navegação de sistemas de arquivos."
      }
    ]
  },
  {
    subject: "Journaling em Sistemas de Arquivos",
    questions: [
      {
        question: "Sistemas de arquivos com journaling registram, em um diário (journal), operações a serem realizadas na estrutura de dados do sistema. Esse mecanismo aumenta a robustez contra falhas, permitindo recuperação rápida após interrupções inesperadas. Ao analisar como funciona um sistema de arquivos journaling, qual alternativa descreve corretamente sua principal vantagem?",
        options: [
          "Permite que o sistema recupere a consistência do sistema de arquivos, pois registra transações antes de aplicá-las à estrutura física.",
          "Aumenta a fragmentação interna, facilitando a reorganização dos blocos no disco.",
          "Evita qualquer possibilidade de corrupção de dados ao impedir que operações incompletas sejam executadas.",
          "Substitui totalmente o sistema de arquivos principal pelo journal, dispensando verificações de integridade.",
          "Reduz totalmente o uso de memória RAM ao armazenar todas as operações no journal."
        ],
        answer: 0,
        feedback: "Resposta correta: A) Permite que o sistema recupere a consistência do sistema de arquivos, pois registra transações antes de aplicá-las à estrutura física. O journaling mantém um registro das operações pendentes, permitindo recuperação rápida e consistente após falhas, sem necessidade de verificação completa do sistema de arquivos."
      }
    ]
  }
];

// Variáveis do quiz
let quizData = [];
let userAnswers = [];
let quizSubmitted = false;
let isFirstLoad = true; // Flag para controlar primeiro carregamento

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
            
            // Atualiza o feedback para refletir a nova posição da resposta
            const correctLetter = String.fromCharCode(65 + newCorrectAnswer);
            const originalCorrectOption = question.options[question.answer];
            const newFeedback = question.feedback.replace(/^Resposta correta: [A-E]\)/, `Resposta correta: ${correctLetter})`);
            
            return {
                ...question,
                options: shuffledOptions,
                answer: newCorrectAnswer,
                feedback: newFeedback
            };
        })
    }));
}

// Função para criar dados originais (sem embaralhar)
function createOriginalQuizData() {
    return originalQuizData.map(subject => ({
        ...subject,
        questions: subject.questions.map(question => ({
            ...question,
            // Mantém feedback original
            feedback: question.feedback || `Resposta correta: ${String.fromCharCode(65 + question.answer)}) ${question.options[question.answer]}`
        }))
    }));
}

// Função para mostrar imagem em zoom
function showImageZoom(imageSrc) {
    // Cria overlay para o zoom
    const overlay = document.createElement('div');
    overlay.id = 'image-zoom-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    // Cria container da imagem
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    const zoomedImage = document.createElement('img');
    zoomedImage.src = imageSrc;
    zoomedImage.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        border-radius: 4px;
        transform: scale(1.3);
        transform-origin: center center;
        display: block;
        margin: 0 auto;
    `;
    
    // Cria botão de fechar
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: -10px;
        right: -10px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: #ff4444;
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        transition: background-color 0.2s;
    `;
    
    closeButton.onmouseover = () => closeButton.style.backgroundColor = '#cc0000';
    closeButton.onmouseout = () => closeButton.style.backgroundColor = '#ff4444';
    
    // Função para fechar o zoom
    function closeZoom() {
        document.body.removeChild(overlay);
    }
    
    // Eventos para fechar
    closeButton.onclick = closeZoom;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeZoom();
    };
    
    // Evento de teclado para ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeZoom();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Monta os elementos
    imageContainer.appendChild(zoomedImage);
    imageContainer.appendChild(closeButton);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);
}

// Torna a função global para poder ser chamada do HTML
window.showImageZoom = showImageZoom;

// CORREÇÃO: Inicializa o quiz
function initializeQuiz() {
    userAnswers = [];
    quizSubmitted = false;

    // CORREÇÃO: Só embaralha no primeiro carregamento OU quando chamado pelo restart
    if (isFirstLoad) {
        // No primeiro carregamento, usa dados originais (sem embaralhar)
        quizData = createOriginalQuizData();
        isFirstLoad = false;
    }
    // Se não é primeiro carregamento, mantém os dados atuais (quizData já foi definido)

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
                    <div class="question-text">${question.question.replace(/\n/g, '<br>')}</div>
                    ${question.image ? `<div class="question-image">
                        <img src="${question.image}" 
                             alt="Imagem da questão" 
                             style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 6px; cursor: pointer; transition: transform 0.2s;"
                             onclick="showImageZoom('${question.image}')"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'">
                    </div>` : ''}
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
                          userAnswers[questionIndex] === question.answer || userAnswers[questionIndex] === null
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

// Função para selecionar opção
function selectOption(questionIndex, optionIndex) {
    if (quizSubmitted) return;
    
    console.log(`Selecionando questão ${questionIndex}, opção ${optionIndex}`);
    userAnswers[questionIndex] = optionIndex;
    console.log('UserAnswers atualizado:', userAnswers);
    showAllQuestions();
}

// Torna a função global
window.selectOption = selectOption;

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
    }, 5000);

    setTimeout(() => {
        if (document.body.contains(alertNotification)) {
            document.body.removeChild(alertNotification);
        }
    }, 5500);
}

// Função para mostrar resultados
function showResults() {
    // Debug: verificar o estado das respostas
    console.log('UserAnswers:', userAnswers);
    console.log('Respostas null:', userAnswers.filter(answer => answer === null).length);
    console.log('Total de questões:', userAnswers.length);
    
    // CORREÇÃO 1: Verifica apenas valores null ou undefined, 0 é uma resposta válida
    const firstUnansweredIndex = userAnswers.findIndex(answer => answer === null || answer === undefined);

    if (firstUnansweredIndex !== -1) {
        console.log('Primeira questão não respondida:', firstUnansweredIndex);
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

    const revealButton = document.getElementById('reveal');
    if (revealButton) {
        revealButton.disabled = true;
        revealButton.style.opacity = '0.5';
        revealButton.style.cursor = 'not-allowed';
    }

    // Calcular resultados
    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });

    const totalQuestions = allQuestions.length;
    const correctAnswers = userAnswers.filter((answer, index) => 
        answer === allQuestions[index].answer
    ).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let resultClass = "";
    let resultMessage = "";
    
    if (percentage >= 70) {
        resultClass = "excellent";
        resultMessage = "Excelente! Você domina bem o conteúdo de Sistemas Operacionais.";
    } else if (percentage >= 50) {
        resultClass = "good";
        resultMessage = "Bom trabalho! Continue praticando para melhorar ainda mais.";
    } else {
        resultClass = "needs-improvement";
        resultMessage = "Você precisa revisar o conteúdo. Recomendo estudar mais as aulas.";
    }

    resultsContainer.innerHTML = `
        <div class="results-card ${resultClass}">
            <h3>Resultado Final</h3>
            <div class="score-display">
                <span class="score-number">${correctAnswers}/${totalQuestions}</span>
                <span class="score-percentage">(${percentage}%)</span>
            </div>
            <p class="result-message">${resultMessage}</p>
            <div class="score-breakdown">
                <div class="score-item correct">
                    <span class="score-label">Corretas:</span>
                    <span class="score-value">${correctAnswers}</span>
                </div>
                <div class="score-item incorrect">
                    <span class="score-label">Incorretas:</span>
                    <span class="score-value">${totalQuestions - correctAnswers}</span>
                </div>
            </div>
        </div>
    `;

    if (submitButton) submitButton.style.display = "none";
    if (restartButton) restartButton.style.display = "inline-block";
}

// CORREÇÃO: Reinicia o quiz com novas opções embaralhadas
function restartQuiz() {
    userAnswers = [];
    quizSubmitted = false;

    // AQUI: Agora SIM embaralha as opções (só quando reiniciar)
    quizData = createShuffledQuizData();

    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });
    userAnswers = new Array(allQuestions.length).fill(null);

    showAllQuestions();
    resultsContainer.innerHTML = "";
    if (submitButton) submitButton.style.display = "inline-block";
    if (restartButton) restartButton.style.display = "none";

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

// CORREÇÃO: Função para limpar todas as respostas SEM embaralhar opções
function clearAnswers() {
    const clearButton = document.getElementById('clear');
    if (clearButton && clearButton.disabled) {
        return;
    }

    // CORREÇÃO: NÃO embaralha mais aqui, só limpa respostas
    // Remove: quizData = createShuffledQuizData();

    // Limpa todas as respostas do usuário
    userAnswers.fill(null);

    // Reset quiz submitted status
    quizSubmitted = false;

    // Atualiza a interface das questões
    showAllQuestions();

    // Se estava mostrando resultados, esconde
    resultsContainer.innerHTML = "";

    // Mostra botão de enviar
    if (submitButton) submitButton.style.display = "inline-block";

    // Esconde botão de reiniciar
    if (restartButton) restartButton.style.display = "none";

    // Scroll suave para o topo
    smoothScrollToTop();
}

// Função para revelar todas as respostas
function revealAnswers() {
    const revealButton = document.getElementById('reveal');
    if (revealButton && revealButton.disabled) {
        return;
    }

    // Marca como enviado para mostrar respostas corretas e feedback
    quizSubmitted = true;
    
    // Reutiliza função para renderizar questões com respostas corretas
    showAllQuestions();
    
    // Calcular e mostrar resultados
    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });

    const totalQuestions = allQuestions.length;
    const correctAnswers = userAnswers.filter((answer, index) => 
        answer === allQuestions[index].answer
    ).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let resultClass = "";
    let resultMessage = "";
    
    if (percentage >= 70) {
        resultClass = "excellent";
        resultMessage = "Excelente! Você domina bem o conteúdo de Sistemas Operacionais.";
    } else if (percentage >= 50) {
        resultClass = "good";
        resultMessage = "Bom trabalho! Continue praticando para melhorar ainda mais.";
    } else {
        resultClass = "needs-improvement";
        resultMessage = "Você precisa revisar o conteúdo. Recomendo estudar mais as aulas.";
    }

    resultsContainer.innerHTML = `
        <div class="results-card ${resultClass}">
            <h3>Resultado Final - Respostas Reveladas</h3>
            <div class="score-display">
                <span class="score-number">${correctAnswers}/${totalQuestions}</span>
                <span class="score-percentage">(${percentage}%)</span>
            </div>
            <p class="result-message">${resultMessage}</p>
            <div class="score-breakdown">
                <div class="score-item correct">
                    <span class="score-label">Corretas:</span>
                    <span class="score-value">${correctAnswers}</span>
                </div>
                <div class="score-item incorrect">
                    <span class="score-label">Incorretas:</span>
                    <span class="score-value">${totalQuestions - correctAnswers}</span>
                </div>
            </div>
        </div>
    `;
    
    // Esconde botão de enviar
    if (submitButton) submitButton.style.display = "none";
    
    // Desabilita botões limpar e revelar
    const clearButton = document.getElementById('clear');
    if (clearButton) {
        clearButton.disabled = true;
        clearButton.style.opacity = '0.5';
        clearButton.style.cursor = 'not-allowed';
    }
    
    if (revealButton) {
        revealButton.disabled = true;
        revealButton.style.opacity = '0.5';
        revealButton.style.cursor = 'not-allowed';
    }
    
    // Mostra botão de reiniciar
    if (restartButton) restartButton.style.display = "inline-block";
    
    // Scroll suave para o topo
    smoothScrollToTop();
}

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    initializeQuiz();
    
    if (submitButton) {
        submitButton.addEventListener("click", showResults);
    }
    
    if (restartButton) {
        restartButton.addEventListener("click", restartQuiz);
    }

    // Adiciona evento ao botão revelar (se existir)
    const revealButton = document.getElementById('reveal');
    if (revealButton) {
        revealButton.addEventListener('click', revealAnswers);
    }

    // Adiciona evento ao botão limpar
    const clearButton = document.getElementById('clear');
    if (clearButton) {
        clearButton.addEventListener('click', clearAnswers);
    }
});














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

const QUIZ_ID = 'revisao_1_ava_so'; // ← ALTERE PARA CADA QUIZ (ex: 'matematica_unidade2', 'historia_capitulo1', etc.)

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
    window.location.href = '../ava3.html';
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