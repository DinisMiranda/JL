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
      // Email de destino - altere aqui para o email onde quer receber as mensagens
      // Por padrão, usando um email falso de teste como solicitado
      const emailDestino = 'teste.inexistente@exemplo-falso.com';
      // Para receber emails reais, descomente e use um dos emails abaixo:
      // const emailDestino = 'joaolobo68925p@adv.oa.pt';
      // const emailDestino = 'joaojlobo@hotmail.com';
      
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

// Função para enviar email
async function sendEmail(data, toEmail) {
  // Método 1: Tentar usar EmailJS se estiver configurado
  const serviceID = 'YOUR_SERVICE_ID';
  const templateID = 'YOUR_TEMPLATE_ID';
  const publicKey = 'YOUR_PUBLIC_KEY';
  
  if (serviceID !== 'YOUR_SERVICE_ID' && templateID !== 'YOUR_TEMPLATE_ID' && publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(publicKey);
    return emailjs.send(serviceID, templateID, {
      to_email: toEmail,
      from_name: data.nome,
      from_email: data.email,
      subject: data.assunto,
      message: data.mensagem,
      reply_to: data.email
    });
  }
  
  // Método 2: Usar FormSubmit (funciona imediatamente, gratuito)
  // Substitua 'seu-email@exemplo.com' pelo email onde quer receber as mensagens
  const emailReceber = toEmail; // ou use um email real aqui: 'seu-email@exemplo.com'
  
  // FormSubmit permite enviar para qualquer email (incluindo o falso de teste)
  // Mas para receber emails reais, use um email válido
  const formData = new FormData();
  formData.append('email', emailReceber);
  formData.append('subject', `Contacto do site: ${data.assunto}`);
  formData.append('message', `Nome: ${data.nome}\nEmail: ${data.email}\nAssunto: ${data.assunto}\n\nMensagem:\n${data.mensagem}`);
  formData.append('_replyto', data.email);
  formData.append('_captcha', 'false');
  
  // Usar o endpoint do FormSubmit
  // Nota: FormSubmit requer um email válido para funcionar corretamente
  // Para teste, você pode usar: https://formsubmit.co/teste@exemplo.com
  const response = await fetch(`https://formsubmit.co/ajax/${emailReceber}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    // Se falhar, usar mailto como fallback
    const subject = encodeURIComponent(data.assunto);
    const body = encodeURIComponent(
      `Nome: ${data.nome}\nEmail: ${data.email}\n\nMensagem:\n${data.mensagem}`
    );
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
  
  return await response.json();
}

