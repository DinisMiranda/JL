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

