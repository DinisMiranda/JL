// JavaScript para Menu Mobile
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuButton && mobileNav) {
  mobileMenuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });
  
  // Close mobile menu when clicking on a link
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
    });
  });
}

// JavaScript para Formulário de Contacto
const form = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');

if (form && formMessage && submitBtn) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Desabilitar botão durante o envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'A enviar...';
    
    // Esconder mensagem anterior
    formMessage.classList.add('hidden');
    
    // Coletar dados do formulário
    const formData = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      assunto: document.getElementById('assunto').value,
      mensagem: document.getElementById('mensagem').value
    };

    try {
      // Email de destino
      const emailDestino = 'joaojlobo@hotmail.com';
      
      // Enviar email
      await sendEmail(formData, emailDestino);
      
      // Mostrar mensagem de sucesso
      formMessage.classList.remove('hidden');
      formMessage.className = 'p-4 rounded-lg mb-4 bg-green-100 text-green-800 border border-green-400';
      formMessage.textContent = 'Mensagem enviada com sucesso! Entraremos em contacto em breve.';
      
      // Limpar formulário
      form.reset();
      
    } catch (error) {
      // Mostrar mensagem de erro
      formMessage.classList.remove('hidden');
      formMessage.className = 'p-4 rounded-lg mb-4 bg-red-100 text-red-800 border border-red-400';
      formMessage.textContent = 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.';
      console.error('Erro ao enviar email:', error);
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    }
  });
}

// Função para enviar email usando EmailJS (já incluído no HTML)
async function sendEmail(data, toEmail) {
  // EmailJS - serviço confiável e gratuito
  // IMPORTANTE: Configure o EmailJS seguindo estes passos:
  // 1. Acesse https://www.emailjs.com e crie uma conta gratuita
  // 2. Vá em "Email Services" e adicione Gmail (ou outro)
  // 3. Vá em "Email Templates" e crie um template com estas variáveis:
  //    - {{from_name}} (nome do remetente)
  //    - {{from_email}} (email do remetente)
  //    - {{subject}} (assunto)
  //    - {{message}} (mensagem)
  // 4. Vá em "Integration" e copie:
  //    - Public Key
  //    - Service ID
  //    - Template ID
  // 5. Substitua os valores abaixo:
  
  const EMAILJS_SERVICE_ID = 'service_7qyix2h'; // Service ID do Gmail
  const EMAILJS_TEMPLATE_ID = 'out15ba'; // Template ID do Contact Us
  const EMAILJS_PUBLIC_KEY = 'mnMtNP24K1Fi5ZIC6'; // Public Key do EmailJS
  
  // Verificar se EmailJS está configurado
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    // Se não estiver configurado, usar mailto como fallback
    const subject = encodeURIComponent(`Contacto do site: ${data.assunto}`);
    const body = encodeURIComponent(
      `Nome: ${data.nome}\nEmail: ${data.email}\n\nMensagem:\n${data.mensagem}`
    );
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      message: 'EmailJS não configurado. Cliente de email aberto. Por favor, envie manualmente.' 
    };
  }
  
  // Inicializar e enviar via EmailJS
  try {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS não carregado');
    }
    
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    const templateParams = {
      from_name: data.nome,
      from_email: data.email,
      subject: data.assunto,
      message: data.mensagem,
      reply_to: data.email
    };
    
    const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    return { success: true };
    
  } catch (error) {
    console.error('Erro ao enviar via EmailJS:', error);
    // Fallback para mailto
    const subject = encodeURIComponent(`Contacto do site: ${data.assunto}`);
    const body = encodeURIComponent(
      `Nome: ${data.nome}\nEmail: ${data.email}\n\nMensagem:\n${data.mensagem}`
    );
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Erro ao enviar. Cliente de email aberto como alternativa.');
  }
}

// Funções para Modal de Artigos
const articles = {
  artigo1: {
    title: 'Breve contributo para o aperfeiçoamento da social-democracia',
    author: 'Por João Lobo',
    content: `
      <blockquote class="border-l-4 border-secondary pl-4 italic text-primary mb-6 text-lg">
        "Todos os dias ao acordar, duas coisas me deixam maravilhado, o céu estrelado acima de mim e a lei moral dentro de mim" - KANT.
      </blockquote>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        "Também eu, me apercebo de uma realidade que está acima de mim, e outra que está "abaixo" de mim. Sou eu, quem, todos dias, ao acordar de manhã cedo, decido qual das duas deve prevalecer: o mundo das coisas concretas, ou o mundo da razão ética e moral no intercâmbio das existências.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Essa escolha pertence a todos nós que a fazemos diariamente. Essa realidade, íntima, unipessoal, incindível e intransmissível, repercute a pessoa que somos. A realidade que se mostra visível, o mundo concreto, e a realidade que está acima de nós, a realidade dos valores, a realidade não escrita, congénita, um dado natural, possível de apreensão e de explicitação e de realização na ordem concreta. Sendo um dado imediato de natureza espiritual apreensível por qualquer um não são muitos os que a conseguem "observar" e a ela se vincular. Aqueles que a conseguem "ver", rezam as lendas, tornam-se "imortais", imortais, porque infelizmente, e cada vez mais, encontramo-nos numa sociedade onde a palavra de hoje não é a palavra de amanhã, onde a responsabilização política (entre outras) cada vez mais desnorteada e sem ética, foi saqueada pelos "senhores" da democracia, das ideias e das palavras, por conseguinte dos chavões próprios do discurso demagógico. Nunca a palavra valeu tão pouco, nunca se viu tal banalização de pessoas e partidos. Assistimos a uma demagogia no grau mais elevado, cansada e sem utilidade concreta no beneficio social comum, salvo para aqueles que ardilosamente a usam.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        A "imortalização" das pessoas não passa por nada divino ou por uma qualquer realidade heróica que nos possam ter ensinado na escola; passa, sim, pela vivência diária e constante, e pelo abdicar daquilo que muitas vezes acreditamos e julgamos verdadeiro mas que descompaginado daquele núcleo fundante da sociedade o não é. Hoje, assistimos a uma desconsideração daqueles valores fundantes e à sua anulação pelo totalitarismo pragmático e pela vazio dos valores e ideais que promovem o confraterno, o solidário e o socialmente justo. O estado, por mais bem regido que seja e por mais poderes de que disponha nunca poderá substituir-se à riqueza transcendente da consciência e da razão moral humana.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Rawls, um dos principais filósofos do século XX, ilumina-nos com o aprofundar do conceito de "justiça social". Uma das suas principais afirmações debruça-se sobre a necessidade de todos os cidadãos serem iguais perante a lei e no modo concreto ser e de estar. Mas será a lei e tudo o que está subjacente a isso, igual perante os nossos olhos?
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Como social-democrata, a minha autodeterminação enquanto ser humano obriga-me a questionar estes aspetos; a definir as bases do enquadramento numa sociedade que reclama a liberdade de pensamento, a liberdade de ação e a capacidade de nos gerir o bem comum, sempre em obediência a padrões éticos e morais, a conceitos abertos, a vinculações de pensamento e de ação que tem as suas raízes orientadoras no "dentro de mim" para uma sociedade fora de mim. Estaremos a atravessar uma crise de valores, ou a políticas atualmente ter-se-á transformado numa realidade distinta de tudo isto. Trata-se de situação que merece funda reflexão. Qual o plano que me quero colocar? Não deverão ser os nossos pensamentos e reflexões a base de tudo o que fazemos, devendo estas mostrar-se flexíveis e de acordo com as circunstancias, os tempos e a nossas vinculações pessoais, em contra ponto à ordem real que é cega e muda se não for intermediada pela ação humana?
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Fazendo um exercício intelectual e colocando-nos sob o "véu da ignorância", despidos de preconceitos, das ideias já estabelecidas, e esquecendo o que nos foi ensinado na escola, invocando Bernstein, também a mim se me afigura que à Social-democracia compete-lhe, o que sempre lhe foi pedido, a manutenção de uma ordem social, refletida, pensada e acima de tudo onde o "eu" não se sobreponha à realidade que teima em nos querer fugir. Não será a "revolução", agora mais de consciências e comportamentos e menos de apropriação coletiva e estatal dos meios materiais de produção - que outros apregoam, dotados de uma sabedoria manhosa, quase animalesca e irresponsável uma falsa revolução? Sê-lo-á sempre desde que, a mesma não se funde nem respeite no catálogo de concreta realização dos direitos Humanos. A Historia de todos os excessos e de todos os "ismos" comprova-o. Eu prefiro a evolução dos conceitos e a sua gradual adaptação à vida concreta. Não nos podemos transformar num ser meramente de ações ou ficções; não podemos ser fruto do que vemos, nem tão pouco podemos subjugar a nossa liberdade à totalidade um bem sistema de produção e distribuição económica, mas sim agir autonomamente nas nossas ações, iluminados pelos padrões em que historicamente a Social-democracia se reconheceu e em permanente revisitação e densificação.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Em síntese: A sociedade atual hiper-complexa e atravessada por um tempo de rápidas transformações exige uma tensão dialética entre as suas formas regulatórias e, a realidade material sobre a qual aquelas incidem. As formas de regulação não podem prescindir de uma conceção da pessoa humana que num primeiro tempo se assuma como entidade autónoma daquela realidade mas que, num segundo tempo, nesta se inscreva, procurando que a ordem social se oriente, de acordo com aqueles valores que se explicitam na autonomia ética e na consciência jurídica. Numa sociedade aberta, o acervo de valores que a orientam, regulam, e projectam no futuro, reclama-se que ocorra, uma intermediação entre os dois planos, de forma a que as exigências do Humano, no plano da igualdade e da dignidade, sejam cumpridas no mais alto grau. Este exercício que deve orientar os órgãos de regulação da sociedade, individuais ou coletivos, reclama insistentemente a convocação daqueles valores morais e éticos mas em simultâneo, na sua aplicação concreta, uma ponderação e uma explicitação mediadas pela razão e pelo bom senso."
      </p>
      
      <p class="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
        Fonte: orossio.pt
      </p>
    `
  },
  artigo2: {
    title: 'Ao meu Dr. Carlos Pires',
    author: 'Por João Lobo',
    content: `
      <p class="text-gray-700 leading-relaxed mb-4">
        Ingressei recentemente na Ordem dos Advogados e não podia deixar de fazer uma reflexão sobre o meu antigo e eterno Patrono, Dr. Carlos Pires, que o próprio destino me fez.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Lembro-me, após o falecimento do meu pai, João Lobo, advogado de profissão, que o mundo se tornou e o escritório necessitava de uma pessoa urgente de me dar apoio.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        O direito e a justiça não esperam por nós advogados, nem pelos clientes desavisados. Já dizia Kafka, no livro "O Processo", "terra para os direitos", quer o Direito "é um dever ser que não é".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Se é certo que os dias e as semanas nos vivenciam com grande ansiedade e incerteza, na minha parte, a verdade depois mostrou-se, porém resiliente, forte e determinada.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Foi, nesta que o Dr. Carlos Pires me convidou para ingressar no seu escritório na qualidade de advogado estagiário.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Desde o primeiro dia que entrei no seu escritório foi de entrega plena (que por casualidade permite os seus pares), pela sua dedicação incansável à causa, ao cliente, aos diferentes assuntos: jurídicas e pode-se considerar nas suas áreas, como um verdadeiro "sábio sobre Direito e a sua prática à semelhança de outros saudosos tempos".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        No discurso do meu estágio assisti a diversos actos, próprios da profissão de advogado, de direito e direitos de escrivão, tendo a oportunidade de acompanhar o meu antigo Patrono, Dr. Carlos Pires, quer da Ilustre Teresa Pires, da Dra. Madalena Nascimento e da Dra. Cristina Lemos, Advogados de confiança do meu patrono, bem como a oportunidade de colaborar com o meu Patrono na redação de requerimentos e diversas peças processuais, tendo ainda assistido a diversas consultas com clientes e a diversas reuniões, podendo, ademais, diversos cursos de formação organizados pela Ordem dos Advogados e Associação Jurídica de Braga, adotando importantes doutrinas mais, diversas das considerações, tendo, de igual forma, acompanhamento, não só do advogado, mas a "pessoa" do advogado.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        O advogado é, de raciocínio e técnica, a sagacidade, a resiliência, mas estas e outras qualidades não bastam. Por me lado, a complexidade de receber o treinamento sob a tutela do Dr. Carlos Pires não apenas contribui para o meu entendimento sobre o que significa ser advogado, mas também as diferentes dimensões que esta realidade é completa.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Por tudo o que somos nos mais pequenos actos.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Sou um testemunho real da "pessoa" recta, leal, transparente e amiga. A sua busca com compreensão pelos clientes é um testemunho da sua dedicação em não só compreender as nuances legais, mas também as preocupações humanas profundas que estão em cada caso.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Não raras as vezes, o meu pai costumava dizer-me: "João, o pré-habitual, depois, todos os dias, perante cada um de nós", o mesmo quer dizer que encontra, em todas as letras pessoas, tendo no princípio a partida e poesia auto-determinação, em escolher, em que idade da história queremos permanecer. Como certa Shakespeare, no Hamlet: "to be, or not to be", that's the question".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Obrigado pelo seu tempo, pela sua fineza de espírito e por compartilhar o seu valioso conhecimento. Tenho a certeza que modelou, como irá modelar, o meu iter para eu também me tornar um advogado exemplar.
      </p>
      
      <p class="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
        Publicado originalmente no jornal Correio do Minho, 16 de Setembro de 2023
      </p>
    `
  }
};

function openArticle(articleId) {
  const article = articles[articleId];
  if (!article) return;
  
  const modal = document.getElementById('article-modal');
  const content = document.getElementById('article-content');
  
  content.innerHTML = `
    <h3 class="text-2xl md:text-3xl font-serif font-semibold text-primary mb-3">${article.title}</h3>
    <p class="text-gray-600 italic mb-6">${article.author}</p>
    ${article.content}
    <div class="mt-8 pt-4 border-t border-gray-200">
      <button onclick="closeArticle()" class="bg-secondary hover:bg-secondary/90 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
        Voltar às Publicações
      </button>
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeArticle() {
  const modal = document.getElementById('article-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function closeArticleOnBackdrop(event) {
  if (event.target.id === 'article-modal') {
    closeArticle();
  }
}

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeArticle();
  }
});

