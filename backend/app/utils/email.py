import smtplib
import secrets
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings


def generate_verification_token() -> str:
    """Gera um token de verificação seguro."""
    return secrets.token_urlsafe(32)


def generate_reset_token() -> str:
    """Gera um token de reset de senha."""
    return secrets.token_urlsafe(32)


def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Envia um email usando as configurações SMTP.
    
    Args:
        email_to: Email de destino
        subject: Assunto do email
        html_content: Conteúdo HTML do email
        text_content: Conteúdo em texto plano (opcional)
    
    Returns:
        bool: True se o email foi enviado com sucesso
    """
    if not all([
        settings.SMTP_HOST,
        settings.SMTP_USER,
        settings.SMTP_PASSWORD,
        settings.EMAILS_FROM_EMAIL
    ]):
        print("Configurações de email não estão completas. Email não enviado.")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.EMAILS_FROM_NAME or settings.PROJECT_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg['To'] = email_to
        
        # Adiciona conteúdo em texto plano se fornecido
        if text_content:
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)
        
        # Adiciona conteúdo HTML
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Conecta ao servidor SMTP
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587)
        
        if settings.SMTP_TLS:
            server.starttls()
        
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Erro ao enviar email: {str(e)}")
        return False


def send_verification_email(email: str, token: str) -> bool:
    """
    Envia email de verificação para um novo usuário.
    
    Args:
        email: Email do usuário
        token: Token de verificação
    
    Returns:
        bool: True se o email foi enviado com sucesso
    """
    subject = f"Verificação de email - {settings.PROJECT_NAME}"
    
    # URL de verificação (você pode personalizar conforme necessário)
    verification_url = f"http://localhost/verify-email?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verificação de Email</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }}
            .content {{ padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{settings.PROJECT_NAME}</h1>
                <h2>Verificação de Email</h2>
            </div>
            <div class="content">
                <p>Olá!</p>
                <p>Obrigado por se registrar no {settings.PROJECT_NAME}. Para ativar sua conta, clique no botão abaixo:</p>
                <div style="text-align: center;">
                    <a href="{verification_url}" class="button">Verificar Email</a>
                </div>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p><a href="{verification_url}">{verification_url}</a></p>
                <p>Este link expira em 24 horas.</p>
                <p>Se você não se registrou no {settings.PROJECT_NAME}, ignore este email.</p>
            </div>
            <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>{settings.PROJECT_NAME} - {settings.EMAILS_FROM_EMAIL}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    {settings.PROJECT_NAME} - Verificação de Email
    
    Olá!
    
    Obrigado por se registrar no {settings.PROJECT_NAME}. Para ativar sua conta, acesse o link abaixo:
    
    {verification_url}
    
    Este link expira em 24 horas.
    
    Se você não se registrou no {settings.PROJECT_NAME}, ignore este email.
    
    {settings.PROJECT_NAME}
    {settings.EMAILS_FROM_EMAIL}
    """
    
    return send_email(email, subject, html_content, text_content)


def send_password_reset_email(email: str, token: str) -> bool:
    """
    Envia email para reset de senha.
    
    Args:
        email: Email do usuário
        token: Token de reset
    
    Returns:
        bool: True se o email foi enviado com sucesso
    """
    subject = f"Reset de senha - {settings.PROJECT_NAME}"
    
    # URL de reset (você pode personalizar conforme necessário)
    reset_url = f"http://localhost/reset-password?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reset de Senha</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }}
            .content {{ padding: 20px; }}
            .button {{ 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #dc3545; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{settings.PROJECT_NAME}</h1>
                <h2>Reset de Senha</h2>
            </div>
            <div class="content">
                <p>Olá!</p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no {settings.PROJECT_NAME}.</p>
                <p>Clique no botão abaixo para redefinir sua senha:</p>
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Redefinir Senha</a>
                </div>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p><a href="{reset_url}">{reset_url}</a></p>
                <p>Este link expira em 1 hora.</p>
                <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            </div>
            <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>{settings.PROJECT_NAME} - {settings.EMAILS_FROM_EMAIL}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    {settings.PROJECT_NAME} - Reset de Senha
    
    Olá!
    
    Recebemos uma solicitação para redefinir a senha da sua conta no {settings.PROJECT_NAME}.
    
    Acesse o link abaixo para redefinir sua senha:
    
    {reset_url}
    
    Este link expira em 1 hora.
    
    Se você não solicitou a redefinição de senha, ignore este email.
    
    {settings.PROJECT_NAME}
    {settings.EMAILS_FROM_EMAIL}
    """
    
    return send_email(email, subject, html_content, text_content)