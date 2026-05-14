document.addEventListener('DOMContentLoaded', function(){
    const botaoDeAcessibilidade = document.getElementById('botao-acessibilidade')
    const opcoesDeAcessibilidade = document.getElementById('opcoes-acessibilidade')
 
    botaoDeAcessibilidade.addEventListener('click', function (){
        botaoDeAcessibilidade.classList.toggle('rotacao-botao');
        opcoesDeAcessibilidade.classList.toggle('apresenta-lista')
 
        const botaoSelecionado = botaoDeAcessibilidade.getAttribute('aria-expanded') === 'true';
        botaoDeAcessibilidade.setAttribute('aria-expanded', !botaoSelecionado)
    })
 
    const aumentaFonteBotao = document.getElementById('aumentar-fonte');
    const diminuiFonteBotao = document.getElementById('diminuir-fonte');
    const alternaContraste = document.getElementById('alterna-contraste')
 
    let tamanhoAtualFonte = 1;
 
    aumentaFonteBotao.addEventListener('click', function(){
        tamanhoAtualFonte += 0.1;
        document.body.style.fontSize = `${tamanhoAtualFonte}rem`
    })
 
    diminuiFonteBotao.addEventListener('click', function(){
        tamanhoAtualFonte -= 0.1;
        document.body.style.fontSize = `${tamanhoAtualFonte}rem`
    })
 
    alternaContraste.addEventListener('click', function(){
        document.body.classList.toggle('alto-contraste')
    })

    const showRecoverButton = document.getElementById('show-recover-menu');
    const recoverSection = document.getElementById('recuperacao');

    if (showRecoverButton && recoverSection) {
        showRecoverButton.addEventListener('click', function() {
            recoverSection.classList.toggle('hidden-section');
            recoverSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const apiBase = '/api/auth';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{1,10}$/;

    function showMessage(element, message, success = true) {
        element.textContent = message;
        element.style.color = success ? '#118C4F' : '#D32F2F';
    }

    function validatePasswordInput(password) {
        if (!passwordPattern.test(password)) {
            return false;
        }
        return true;
    }

    const validateEmailForm = document.getElementById('validate-email-form');
    const validateEmailMessage = document.getElementById('validate-email-message');

    validateEmailForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email-validation').value.trim();

        if (!email || !emailPattern.test(email)) {
            showMessage(validateEmailMessage, 'Informe um email válido.', false);
            return;
        }

        try {
            const response = await fetch(`${apiBase}/validate-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            showMessage(validateEmailMessage, data.msg || 'Resposta recebida', response.ok);
        } catch (err) {
            showMessage(validateEmailMessage, 'Erro de conexão: tente novamente.', false);
        }
    });

    const validatePasswordForm = document.getElementById('validate-password-form');
    const validatePasswordMessage = document.getElementById('validate-password-message');

    validatePasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email-password-validation').value.trim();
        const password = document.getElementById('password-validation').value;

        if (!email || !emailPattern.test(email)) {
            showMessage(validatePasswordMessage, 'Informe um email válido.', false);
            return;
        }
        if (!validatePasswordInput(password)) {
            showMessage(validatePasswordMessage, 'Senha inválida. Deve ter até 10 caracteres, 1 maiúscula, 1 número e 1 especial.', false);
            return;
        }

        try {
            const response = await fetch(`${apiBase}/validate-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            showMessage(validatePasswordMessage, data.msg || 'Resposta recebida', response.ok);
        } catch (err) {
            showMessage(validatePasswordMessage, 'Erro de conexão: tente novamente.', false);
        }
    });

    const recoverPasswordForm = document.getElementById('recover-password-form');
    const recoverPasswordMessage = document.getElementById('recover-password-message');

    recoverPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('recover-email').value.trim();

        if (!email || !emailPattern.test(email)) {
            showMessage(recoverPasswordMessage, 'Informe um email válido.', false);
            return;
        }

        try {
            const response = await fetch(`${apiBase}/recover-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage(recoverPasswordMessage, `Token gerado: ${data.token}`);
            } else {
                showMessage(recoverPasswordMessage, data.msg || 'Erro ao gerar token.', false);
            }
        } catch (err) {
            showMessage(recoverPasswordMessage, 'Erro de conexão: tente novamente.', false);
        }
    });

    const resetPasswordForm = document.getElementById('reset-password-form');
    const resetPasswordMessage = document.getElementById('reset-password-message');

    resetPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const token = document.getElementById('reset-token').value.trim();
        const password = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-password-confirm').value;

        if (!token) {
            showMessage(resetPasswordMessage, 'Informe o token de recuperação.', false);
            return;
        }
        if (!validatePasswordInput(password)) {
            showMessage(resetPasswordMessage, 'Senha inválida. Deve ter até 10 caracteres, 1 maiúscula, 1 número e 1 especial.', false);
            return;
        }
        if (password !== confirmPassword) {
            showMessage(resetPasswordMessage, 'As senhas não conferem.', false);
            return;
        }

        try {
            const response = await fetch(`${apiBase}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmpassword: confirmPassword }),
            });
            const data = await response.json();
            showMessage(resetPasswordMessage, data.msg || 'Resposta recebida', response.ok);
        } catch (err) {
            showMessage(resetPasswordMessage, 'Erro de conexão: tente novamente.', false);
        }
    });

    const menuButtons = document.querySelectorAll('.recuperacao-menu button');
    const formsContainer = document.getElementById('recuperacao-forms');
    const allForms = document.querySelectorAll('#recuperacao-forms form');

    menuButtons.forEach((button) => {
        button.addEventListener('click', function() {
            const targetFormId = button.dataset.target;
            formsContainer.classList.remove('hidden');
            allForms.forEach((form) => {
                form.classList.add('hidden');
                const message = form.querySelector('.form-message');
                if (message) {
                    message.textContent = '';
                }
            });
            const targetForm = document.getElementById(targetFormId);
            if (targetForm) {
                targetForm.classList.remove('hidden');
            }
        });
    });
});
