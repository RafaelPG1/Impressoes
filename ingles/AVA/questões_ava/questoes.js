// Configuração do quiz de Inglês
// Configuração do quiz de Inglês
const originalQuizData = [
  {
    subject: "Aula 9: Adjetivos Comparativos e Imperativos",
    questions: [
      {
        question: "Sobre o uso dos adjetivos comparativos em Língua Inglesa, considerando as regras de formação pela adição ER ao final do adjetivo. Quais das alternativas abaixo está incorreta?",
        options: [
          "worse",
          "happier",
          "busier",
          "tilted",
          "simpler"
        ],
        answer: 3,
        feedback: "Resposta correta: D) tilted. 'Tilted' não segue a regra de adjetivos comparativos com -er, pois não é um adjetivo comparativo regular."
      },
      {
        question: "Considerando a formação dos adjetivos comparativos/superlativos terminados em consoante + vogal + consoante, popularmente conhecida como regra do CVC. É correto afirmar que:",
        options: [
          "a vogal deve ser duplicada antes da inclusão da terminação (-er/-est).",
          "deve ser retirada a consoante final e ser feita a inclusão da terminação (-er/-est).",
          "deve ser feita inclusão da terminação (-er/-est) após a consoante final.",
          "a consoante início deve ser duplicada antes da inclusão da terminação (-er/-est).",
          "a consoante final deve ser duplicada antes da inclusão da terminação (-er/-est)."
        ],
        answer: 4,
        feedback: "Resposta correta: E) a consoante final deve ser duplicada antes da inclusão da terminação (-er/-est). Na regra CVC, dobra-se a última consoante antes de adicionar -er ou -est (big → bigger → biggest)."
      },
      {
        question: "Sobre a organização frasal no uso dos Adjetivos Comparativos, é correto dizer que temos a seguinte organização:",
        options: [
          "Substantivo (sujeito) + verbo + adj. comparativo + most + subst. (objeto).",
          "Substantivo (sujeito) + verbo + adj. comparativo + than + subst. (objeto).",
          "Substantivo (sujeito) + verbo + adjetivo + than + subst. (objeto).",
          "Substantivo (sujeito) + verbo + adj. comparativo + subst. (objeto).",
          "Substantivo (sujeito) + verbo + adj. comparativo + more + subst. (objeto)."
        ],
        answer: 1,
        feedback: "Resposta correta: B) Substantivo (sujeito) + verbo + adj. comparativo + than + subst. (objeto). Exemplo: 'John is taller than Mary.'"
      },
      {
        question: "No caso dos Comparativos e Superlativos irregulares, alguns adjetivos bastante comuns possuem formas comparativas e superlativas completamente irregulares. Observe as opções a seguir, assinale a que está incorreta:",
        options: [
          "Little - less - least",
          "Much - more - more",
          "Bad - worse - worst",
          "Good - better - best",
          "Far - further / farther - furthest / farthest"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Much - more - more. A forma correta é 'Much - more - most' (muito - mais - o mais)."
      },
      {
        question: "O imperativo é utilizado pelos falantes de uma língua para dar uma sugestão, uma ordem, um conselho ou uma instrução para que uma determinada ação aconteça. Nesse sentido, para montar uma sentença no imperativo é necessário:",
        options: [
          "basta acrescentar o auxiliar 'do'.",
          "inserir a partícula 'to' dos verbos.",
          "retirar a partícula 'to' dos verbos.",
          "acrescentar a expressão 'please' (por favor) no começo ou no final da frase.",
          "dar menos ênfase na frase basta retirar o auxiliar 'do' no começo da frase."
        ],
        answer: 2,
        feedback: "Resposta correta: C) retirar a partícula 'to' dos verbos. O imperativo usa o verbo no infinitivo sem 'to' (Ex: 'Open the door!' em vez de 'To open the door!')."
      }
    ]
  },
  {
    subject: "Aula 10: Partes do Discurso e Phrasal Verbs",
    questions: [
      {
        question: "Sobre as Partes do Discurso em Inglês, observe as frases abaixo:\n\nI like Facebook.com.\nPlease look under the bed.\nHe lives in my house.\n\nAs palavras em destaque são respectivamente:",
        options: [
          "Verbo - Preposição - Substantivo",
          "Advérbio - Preposição - Substantivo",
          "Preposição - Verbo - Substantivo",
          "Substantivo - Preposição - Verbo",
          "Substantivo - Verbo - Advérbio"
        ],
        answer: 0,
        feedback: "Resposta correta: A) Verbo - Preposição - Substantivo. 'Like' é verbo, 'under' é preposição, e 'house' é substantivo."
      },
      {
        question: "Observando as regras e significado dos PHRASAL VERBS, qual das alternativas abaixo corresponde ao destacado na oração: 'Doctors diagnose Alzheimer's on the basis of medical examination, patient history and cognitive tests, and can use imaging to rule out other forms of dementia'.",
        options: [
          "eliminate",
          "add",
          "include",
          "accept",
          "allow"
        ],
        answer: 0,
        feedback: "Resposta correta: A) eliminate. 'Rule out' significa eliminar, descartar possibilidades."
      },
      {
        question: "Considerando o significado em Português, assinale a alternativa incorreta quanto à tradução dos phrasal verbs (verbos frasais):",
        options: [
          "Find out - perder algo ou alguma pessoa",
          "Get by - sobreviver ou 'se virar'",
          "Go ahead - continuar, seguir em frente, prosseguir",
          "Keep away - evitar, manter distância de alguma coisa ou manter alguém longe de algo",
          "Look back - lembrar-se de algo ou olhar para trás"
        ],
        answer: 0,
        feedback: "Resposta correta: A) Find out - perder algo ou alguma pessoa. 'Find out' significa descobrir, averiguar, não perder."
      },
      {
        question: "Em Língua Inglesa, os Verbos Frasais são classificados em transitivos ou intransitivos. Segundo as regras, qual frase a seguir está incorreta:",
        options: [
          "He woke up late for work.",
          "The noise woke everyone up.",
          "Clara woke them up.",
          "The noise woke up everyone.",
          "Clara woke up them."
        ],
        answer: 4,
        feedback: "Resposta correta: E) Clara woke up them. Quando há pronome objeto, ele deve vir entre o verbo e a partícula: 'woke them up', não 'woke up them'."
      },
      {
        question: "Qual o significado do Phrasal Verb em destaque na frase: 'Don't wait up for me'?",
        options: [
          "não espere acordado por mim",
          "não fique aqui comigo",
          "não acorde comigo",
          "espere por mim aqui",
          "não espere por mim"
        ],
        answer: 0,
        feedback: "Resposta correta: A) não espere acordado por mim. 'Wait up' significa ficar acordado esperando alguém."
      }
    ]
  },
  {
    subject: "Aula 11: Tecnologia e o Mundo Globalizado",
    questions: [
      {
        question: "O texto 'History of Computers: A Brief Timeline' afirma que a história dos computadores começou:",
        options: [
          "em uma garagem em 1939",
          "no século XX",
          "em 1821",
          "há mais de 100 anos",
          "no século XIX"
        ],
        answer: 4,
        feedback: "Resposta correta: E) no século XIX. A história dos computadores começou no século XIX com os conceitos iniciais de máquinas de calcular."
      },
      {
        question: "De acordo com o texto 'History of Computers: a brief timeline', durante o século XIX os computadores foram teorizados por:",
        options: [
          "Físicos e matemáticos",
          "Cientistas e empresários",
          "Professores de física e matemática",
          "Professores do MIT",
          "Matemáticos e empresários"
        ],
        answer: 4,
        feedback: "Resposta correta: E) Matemáticos e empresários. Durante o século XIX, matemáticos e empresários teorizaram e desenvolveram os primeiros conceitos de computadores."
      },
      {
        question: "Em 1941 o primeiro computador digital do mundo foi criado por um inventor e engenheiro alemão Konrad Zuse, mas de acordo com o texto 'History of Computers: a brief timeline', o que aconteceu com esse computador?",
        options: [
          "A máquina foi destruída durante um bombardeio em Berlim durante a Segunda Guerra Mundial.",
          "Foi relançado e nomeado de Z4.",
          "A máquina foi utilizada para um bombardeio em Berlim durante a Segunda Guerra Mundial.",
          "Não pôde ser inaugurado.",
          "A máquina foi utilizada para decifrar os códigos nazistas durante a Segunda Guerra Mundial."
        ],
        answer: 0,
        feedback: "Resposta correta: A) A máquina foi destruída durante um bombardeio em Berlim durante a Segunda Guerra Mundial. O primeiro computador digital de Zuse foi destruído durante a guerra."
      },
      {
        question: "Segundo o texto 'History of Computers: a brief timeline', o que marcou o desenvolvimento do computador de uma máquina especializada para acadêmicos para uma tecnologia mais acessível ao público em geral?",
        options: [
          "em 1968 quando foi lançado o protótipo de um computador moderno em uma conferência em São Francisco, incluindo um mouse e uma interface gráfica de usuário (GUI).",
          "em 1958 com a descoberta do circuito integrado, conhecido como chip de computador.",
          "em 1969 quando desenvolveram um sistema operacional que tornou uma rede em larga escala de diversos sistemas de computação e a Internet, prática.",
          "1970 com a criação do primeiro chip de memória de acesso dinâmico (DRAM).",
          "em 1968 criaram um computador em um centro de pesquisa para aumentar o intelecto humano."
        ],
        answer: 0,
        feedback: "Resposta correta: A) em 1968 quando foi lançado o protótipo de um computador moderno em uma conferência em São Francisco, incluindo um mouse e uma interface gráfica de usuário (GUI). Este foi um marco na democratização da computação."
      },
      {
        question: "A década dos anos 1980 foi marcada por grandes lançamentos e descobertas tecnológicas mais avançadas em relação à década anterior. Observe o quadro sobre grandes lançamentos e descobertas tecnológicas e marque V para Verdadeiro e F para Falso.\n\n( ) 1801: Joseph Marie Jacquard inventa um tear que usa cartões perfurados\n( ) 1821: Charles Babbage concebe a 'Difference Engine'\n( ) 1848: Ada Lovelace escreve o primeiro programa de computador do mundo",
        options: [
          "V, V, V, F, F",
          "F, F, V, V, V",
          "V, F, F, V, V",
          "F, F, F, F, F",
          "V, V, V, V, V"
        ],
        answer: 1,
        feedback: "Resposta correta: B) F, F, V, V, V. As duas primeiras afirmações sobre 1801 e 1821 são falsas (não foram na década de 1980), mas as demais sobre Ada Lovelace e desenvolvimentos subsequentes são verdadeiras."
      }
    ]
  },
  {
    subject: "Aula 12: Comunicação e Tecnologia",
    questions: [
      {
        question: "No texto 01, a charge faz uma referência ao uso exacerbado da tecnologia em detrimento da prática que está sendo realizada pelo personagem em questão. O texto traz ainda um vasto campo semântico referente ao mundo tecnológico. Considerando as palavras que aparecem na charge, qual delas não faz referência às tecnologias da comunicação e da informação?",
        options: [
          "DVD",
          "CABLE",
          "WIDE SCREEN",
          "VCR",
          "BOOK"
        ],
        answer: 4,
        feedback: "Resposta correta: E) BOOK. Livro não é uma tecnologia da comunicação e informação digital, enquanto DVD, Cable, Wide Screen e VCR são."
      },
      {
        question: "Partindo da ideia expressa no texto 02 'How Technology Affects Communication', é correto afirmar que:",
        options: [
          "O aprendizado de máquina e a inteligência artificial ainda são de pouco impacto. Os chatbots atualmente atendem uma média abaixo de 25.000 conversas por mês.",
          "Aproximadamente dois em cada dez americanos usam plataformas de chat de vídeo para fins sociais ou de trabalho.",
          "Futuramente uma tendência será a ampla adoção da tecnologia de videoconferência.",
          "Além disso, 75% de todas as empresas ainda não utilizam ferramentas de automação nas suas atividades.",
          "A comunicação da tecnologia nos afeta continuamente. À medida que fazemos avanços tecnológicos, novas tendências em comunicação surgem e muitas vezes se tornam a norma."
        ],
        answer: 4,
        feedback: "Resposta correta: E) A comunicação da tecnologia nos afeta continuamente. À medida que fazemos avanços tecnológicos, novas tendências em comunicação surgem e muitas vezes se tornam a norma. Esta afirmação reflete corretamente o impacto contínuo da tecnologia na comunicação."
      },
      {
        question: "O texto 03 nos traz dois perfis diferentes de usuários digitais, Digital Immigrants (Imigrantes Digitais) e os Digital Natives (Nativos Digitais). Cada um dos perfis apresenta características diferentes. Dentre as características listadas abaixo, qual delas não pertence aos Nativos Digitais (Digital Natives)?",
        options: [
          "Nascido durante ou após a era digital",
          "Obter informações de sites de notícias tradicionais",
          "Extremamente social",
          "Aprendizes intuitivos",
          "Orientado para multimídia"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Obter informações de sites de notícias tradicionais. Esta é uma característica dos Imigrantes Digitais, não dos Nativos Digitais que preferem fontes digitais diversificadas."
      },
      {
        question: "No texto 01, aparecem as palavras wide screen - remote - cable. Qual das alternativas abaixo corresponde respectivamente aos seus significados em Língua Portuguesa?",
        options: [
          "tela ampla - controle remoto - cabo",
          "tela - remoto - cabo",
          "tela ampla - remoto - cabo de TV",
          "tela plana - remoto - cabo",
          "tela ampla - cabo - remoto"
        ],
        answer: 0,
        feedback: "Resposta correta: A) tela ampla - controle remoto - cabo. Estas são as traduções corretas dos termos técnicos relacionados à tecnologia."
      },
      {
        question: "Na frase 'and just what do you think you are doing?!!!', no texto 01, a que ela se refere?",
        options: [
          "uma crítica pelo fato de o usuário trocar o uso das tecnologias digitais da comunicação e da informação pela leitura do livro",
          "uma crítica à falta de conhecimento das tecnologias digitais da comunicação e da informação",
          "uma crítica ao uso excessivo das tecnologias digitais da comunicação e da informação",
          "uma crítica ao analfabetismo digital, e não conhecimento das tecnologias digitais da comunicação e da informação",
          "uma crítica ao personagem que troca o livro por um uso mais frequente das tecnologias digitais da comunicação e da informação"
        ],
        answer: 0,
        feedback: "Resposta correta: A) uma crítica pelo fato de o usuário trocar o uso das tecnologias digitais da comunicação e da informação pela leitura do livro. A charge ironiza o momento em que o personagem escolhe ler um livro físico em vez de usar tecnologia."
      }
    ]
  },
  {
    subject: "Aula 13: Saúde e Tecnologia",
    questions: [
      {
        question: "A pandemia por COVID-19 fez com que o mundo nos seus diversos setores passasse por grandes transformações. Na saúde esse movimento foi ainda mais intenso. De acordo com o último relatório do Minsait, uma empresa da Indra que destaca tendências na digitalização da saúde (TEXTO 01), isso possibilitará:",
        options: [
          "diminuiu a geração mais rápida de diagnósticos, comprometendo o atendimento remoto e monitoramento remoto de pacientes em tratamento ou quarentena, congestionando os sistemas de saúde.",
          "um retardo no diagnóstico, prejudicando o atendimento remoto e monitoramento remoto de pacientes em tratamento ou quarentena, ampliando o congestionamento dos sistemas de saúde.",
          "possibilitou a geração mais rápida de diagnósticos, melhor atendimento remoto e monitoramento remoto de pacientes em tratamento ou quarentena, mas não ajudou a descongestionar os sistemas de saúde.",
          "a geração de mais empregos, para melhorar o atendimento de pacientes em tratamento ou quarentena, pois as máquinas não conseguem descongestionar os sistemas de saúde, por si só.",
          "a geração mais rápida de diagnósticos, melhor atendimento remoto e monitoramento remoto de pacientes em tratamento ou quarentena, ajudando a descongestionar os sistemas de saúde."
        ],
        answer: 2,
        feedback: "Resposta correta: C) possibilitou a geração mais rápida de diagnósticos, melhor atendimento remoto e monitoramento remoto de pacientes em tratamento ou quarentena, mas não ajudou a descongestionar os sistemas de saúde. A digitalização trouxe benefícios mas ainda há desafios no descongestionamento."
      },
      {
        question: "A pandemia causada pela Covid-19 deu, de fato, um importante impulso à digitalização dos sistemas de saúde, oferecendo benefícios significativos para profissionais e pacientes. Quais as novas soluções tecnológicas:",
        options: [
          "serão parte significativa do sistema de saúde do futuro, que poderá melhorar a qualidade da saúde pública, a eficiência dos processos e a capacidade de resposta a crises de saúde como a atual.",
          "serão a base do sistema de saúde do futuro, que terá de melhorar a qualidade dos serviços oferecidos em saúde, a eficiência dos processos e a capacidade de lidar com crises de saúde como a atual.",
          "serão a base do sistema de saúde já existente, que terá de melhorar a qualidade da saúde, a eficiência dos processos e a capacidade de resposta a crises de saúde como a atual.",
          "serão a base do sistema de saúde do futuro, que terá de ampliar o serviço no atendimento em saúde, corrigindo a eficiência dos processos e isso afetará as respostas a crises de saúde como a atual.",
          "serão apoio ao sistema de saúde do futuro, que melhorará a qualidade da saúde, a execução dos processos e a capacidade de resposta a crises de saúde futuras."
        ],
        answer: 2,
        feedback: "Resposta correta: C) serão a base do sistema de saúde já existente, que terá de melhorar a qualidade da saúde, a eficiência dos processos e a capacidade de resposta a crises de saúde como a atual. As soluções tecnológicas se integrarão aos sistemas existentes."
      },
      {
        question: "A pandemia por COVID-19 fortaleceu o uso de outros recursos para a prática da medicina. Na Itália, um foi muito relevante durante o período de quarentena. Qual recurso foi esse?",
        options: [
          "Os exames computadorizados",
          "Os aplicativos de prescrição",
          "A automedicação",
          "O autoatendimento",
          "A telemedicina"
        ],
        answer: 4,
        feedback: "Resposta correta: E) A telemedicina. Durante a pandemia, a telemedicina se tornou essencial para manter o atendimento médico à distância."
      },
      {
        question: "Os rins são órgãos complexos e resistentes, cada um com aproximadamente o tamanho de um punho. Eles filtram cerca de 140 litros de sangue por dia, deixando para trás um ou dois litros de água e resíduos na forma de urina. No entanto, muitas pessoas ao redor do mundo sofrem com doenças decorrentes de crises nos rins. De acordo com TEXTO 02, qual o continente que mais precisa de tratamento para doentes renais e o que menos precisa, respectivamente?",
        options: [
          "Europa/Ásia",
          "Ásia/Oceania",
          "Oceania/Ásia",
          "América Latina/Europa",
          "América do Norte/Europa"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Ásia/Oceania. A Ásia possui a maior necessidade de tratamentos renais, enquanto a Oceania possui a menor demanda."
      },
      {
        question: "O tratamento para doenças renais ainda é uma realidade distante para muitas pessoas no mundo, sendo cada vez mais uma necessidade negligenciada. Além disso, o acesso irregular em todo o mundo prejudica o tratamento. De acordo com o texto, quais regiões se destacam na baixa eficiência desses tratamentos?",
        options: [
          "África Subsaariana/América Latina/América do Norte",
          "Europa/África Subsaariana/Oceania",
          "África Subsaariana/Caribe/Europa",
          "Ásia/África/África Subsaariana",
          "Ásia/América Latina/Caribe"
        ],
        answer: 3,
        feedback: "Resposta correta: D) Ásia/África/África Subsaariana. Estas regiões enfrentam os maiores desafios no acesso a tratamentos renais eficientes."
      }
    ]
  },
  {
    subject: "Aula 14: Educação e Tecnologia",
    questions: [
      {
        question: "O texto 1 fala sobre o crescimento dos gastos com tecnologia na área da Educação. Na seção são explorados alguns valores gastos nesse setor. De acordo com o texto, quanto a cidade de Chicago investiu em educação pública em um ano?",
        options: [
          "26 milhões",
          "35 milhões",
          "36 milhões",
          "40 milhões",
          "12 milhões"
        ],
        answer: 3,
        feedback: "Resposta correta: D) 40 milhões. A cidade de Chicago investiu 40 milhões de dólares em educação pública tecnológica."
      },
      {
        question: "Os professores têm implementado cada vez mais o uso de tecnologias em suas aulas de acordo com o texto 01. Dentro os principais recursos utilizados se destacam a utilização dos quadros brancos interativos utilizados para dinamizar projeções. Na seção 02, afirma-se que o percentual de professores que utiliza esse recurso é de:",
        options: [
          "15%",
          "23%",
          "4%",
          "97%",
          "8%"
        ],
        answer: 1,
        feedback: "Resposta correta: B) 23%. Vinte e três por cento dos professores utilizam quadros brancos interativos em suas aulas."
      },
      {
        question: "Considerando o contexto tecnológico e a utilização de diversos recursos em sala de aula pelos professores, relacionados na Seção 03 do texto 01. Quantos por cento dos professores afirmam que o uso de apps traz benefícios para suas aulas?",
        options: [
          "93%",
          "90%",
          "60%",
          "71%",
          "64%"
        ],
        answer: 3,
        feedback: "Resposta correta: D) 71%. Setenta e um por cento dos professores afirmam que aplicativos educacionais trazem benefícios significativos para suas aulas."
      },
      {
        question: "A tecnologia desempenhou e continua a desempenhar um papel essencial para fornecer educação aos alunos fora da escola. De forma louvável, todos os países foram capazes de implantar tecnologias de aprendizagem remota usando uma combinação de plataformas. Dentre as quais podemos destacar:",
        options: [
          "TV, rádio e computadores",
          "TV, rádio e apps",
          "TV, rádio, plataformas online e móvel",
          "TV, rádio e tablets",
          "TV, rádio e celulares"
        ],
        answer: 2,
        feedback: "Resposta correta: C) TV, rádio, plataformas online e móvel. Esta combinação multimodal permitiu alcançar diferentes públicos durante o ensino remoto."
      },
      {
        question: "Leia o trecho do texto 02 sobre investimentos em EdTech e assinale V (verdadeiro) e F (falso).\n\n( ) Os países estão buscando investimentos em conectividade para alavancar o ensino híbrido.\n( ) Diante da dualidade do ensino remoto, essa é uma maneira de fornecer uma educação ao longo da vida a todos os cidadãos.\n( ) Soluções em nuvem e entrega multimodal de educação são algumas das questões que estão sendo trabalhadas no ensino híbrido.",
        options: [
          "V, V, V",
          "V, F, F",
          "F, F, F",
          "V, F, V",
          "F, V, V"
        ],
        answer: 3,
        feedback: "Resposta correta: D) V, F, V. A primeira e terceira afirmações são verdadeiras sobre investimentos em conectividade e soluções tecnológicas educacionais."
      }
    ]
  },
  {
    subject: "Aula 15: Tecnologia e Desenvolvimento Pessoal",
    questions: [
      {
        question: "O mundo globalizado dita frequentes mudanças no mercado de trabalho. No texto da figura 1, são apontados os principais caminhos de se melhorar o seu desenvolvimento profissional. De acordo com o texto, marque V (verdadeiro) e F (falso) para as afirmações abaixo.\n\n( ) Investir no seu desenvolvimento físico e saúde\n( ) Trabalhar focado e com objetivo\n( ) Investir no desenvolvimento mental\n( ) Investir no desenvolvimento de novas habilidades\n( ) Investir na compra de novos equipamentos",
        options: [
          "F, V, V, V, V",
          "F, F, F, F, F",
          "V, V, V, V, F",
          "V, V, V, V, V",
          "V, F, V, V, V"
        ],
        answer: 2,
        feedback: "Resposta correta: C) V, V, V, V, F. Desenvolvimento físico, trabalho focado, desenvolvimento mental e novas habilidades são essenciais; compra de equipamentos não é mencionada como desenvolvimento profissional."
      },
      {
        question: "O texto 02 nos elucida sobre 'As sete tendências disruptivas que moldam o futuro do trabalho'. Dentre elas, uma que se destaca é o 'trabalho contingente'. Esse tipo de trabalho acontece quando um indivíduo ou empresa é empregado por outra empresa numa base temporária, de acordo com a necessidade do empregador. Qual percentual desse tipo de emprego nos Estados Unidos até 2020?",
        options: [
          "45%",
          "77%",
          "47%",
          "40%",
          "35%"
        ],
        answer: 3,
        feedback: "Resposta correta: D) 40%. Quarenta por cento dos empregos nos EUA eram contingentes (temporários/freelance) até 2020."
      },
      {
        question: "Pensando nas 'sete tendências disruptivas que moldam o futuro do trabalho' apontadas pelo texto da figura 2. Qual das alternativas abaixo não faz parte dessas tendências?",
        options: [
          "Mudança na natureza das carreiras profissionais",
          "Trabalho que se manterão mesmo com a automação",
          "Diversidade e mudança geracional",
          "A tecnologia está em toda parte",
          "Tsunami de dados/informações"
        ],
        answer: 1,
        feedback: "Resposta correta: B) Trabalho que se manterão mesmo com a automação. Esta não é uma das sete tendências disruptivas mencionadas no texto."
      },
      {
        question: "A charge (texto figura 3) mostra um ambiente de trabalho onde acontece uma reunião de uma empresa que tem como seu principal objetivo a 'transformação digital'. Podemos afirmar que:",
        options: [
          "Nem todos os colaboradores da empresa conhecem o real sentido de transformação digital.",
          "Os colaboradores conhecem bem os seus instrumentos de trabalho.",
          "O TikTok faz parte de uma das grandes transformações digitais.",
          "O termo transformação digital é bem compreendido por todos.",
          "Os encontros pelo Zoom revolucionaram a forma como as pessoas trabalham e se comunicam."
],
answer: 0,
feedback: "Resposta correta: A) Nem todos os colaboradores da empresa conhecem o real sentido de transformação digital. A charge satiriza a confusão entre ferramentas digitais e verdadeira transformação digital."
},
{
question: "Pensando na 'transformação digital'. Qual dos aplicativos/redes sociais/recurso não são citados no texto?",
options: [
"GOOGLE MEET",
"TIKTOK",
"AGILE",
"SLACK",
"ZOOM"
],
answer: 0,
feedback: "Resposta correta: A) GOOGLE MEET. Google Meet não é mencionado no texto sobre transformação digital, enquanto TikTok, Agile, Slack e Zoom são citados."
}
]
}
];

// Variáveis do quiz
let quizData = []; // Dados do quiz (inicialmente sem embaralhar)
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
            const newFeedback = `Resposta correta: ${correctLetter}) ${originalCorrectOption}`;
            
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
        transform: scale(1.3); /* zoom menor e mais estável */
        transform-origin: center center;
        display: block;
        margin: 0 auto;
    `;

    
    // Cria botão de fechar
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: -25px;
        right: -50px;
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

// Inicializa o quiz
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
                    <div class="question-text">${question.question}</div>
                    ${question.image ? `<div class="question-image">
                        <img src="${question.image}" 
                             alt="Imagem da questão" 
                             style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 6px; cursor: pointer; transition: transform 0.2s;"
                             onclick="showImageZoom('${question.image}')"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'">
                    </div>` : ''}
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
                          userAnswers[questionIndex] !== null && userAnswers[questionIndex] === question.answer
                            ? "correct-feedback"
                            : (userAnswers[questionIndex] === null ? "correct-feedback" : "incorrect-feedback")
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
    
    userAnswers[questionIndex] = optionIndex;
    showAllQuestions();
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
    }, 5000);
}

// Função para mostrar resultados - VERSÃO CORRETA
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
        resultMessage = "Excelente! Você domina bem o conteúdo de Inglês Técnico.";
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

    submitButton.style.display = "none";
    restartButton.style.display = "inline-block";
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

// Função para limpar todas as respostas SEM embaralhar opções
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

    // Desmarca todos os inputs de radio/checkbox
    const respostas = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    respostas.forEach(input => {
        input.checked = false;
    });

    // Atualiza a interface das questões
    showAllQuestions();

    // Se estava mostrando resultados, esconde
    resultsContainer.innerHTML = "";

    // Mostra botão de enviar
    submitButton.style.display = "inline-block";

    // Esconde botão de reiniciar
    restartButton.style.display = "none";

    // Scroll suave para o topo
    smoothScrollToTop();
}

// Função para revelar todas as respostas
function revealAnswers() {
    // Marca como enviado para mostrar respostas corretas e feedback
    quizSubmitted = true;
    
    // Para mostrar o feedback, precisamos garantir que todas as questões tenham uma "resposta"
    // Mesmo que seja null, vamos forçar para mostrar o feedback de todas
    const allQuestions = [];
    quizData.forEach((subject) => {
        allQuestions.push(...subject.questions);
    });

    // Para questões não respondidas, mantém null mas força a exibição do feedback
    // Modifica temporariamente a função showAllQuestions para mostrar feedback mesmo com null
    
    // Reutiliza função para renderizar questões com respostas corretas
    showAllQuestions();
    
    // Calcular e mostrar resultados
    const totalQuestions = allQuestions.length;
    const correctAnswers = userAnswers.filter((answer, index) => 
        answer === allQuestions[index].answer
    ).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let resultClass = "";
    let resultMessage = "";
    
    if (percentage >= 70) {
        resultClass = "excellent";
        resultMessage = "Excelente! Você domina bem o conteúdo de Inglês Técnico.";
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
    submitButton.style.display = "none";
    
    // Desabilita botões limpar e revelar
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
    
    // Mostra botão de reiniciar
    restartButton.style.display = "inline-block";
    
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

const QUIZ_ID = 'questoes_AVA_ing'; // ← ALTERE PARA CADA QUIZ (ex: 'matematica_unidade2', 'historia_capitulo1', etc.)

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
    window.location.href = '../ava1.html';
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