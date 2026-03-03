/* eslint-disable */
// ESTRUTURA DE CONFIG ESPERADA NO BANCO DE DADOS
// O bloco abaixo é apenas documentação; mantido como comentário para que o arquivo
// seja um JS válido e o parser do ESLint não falhe.
/*
{
  "global": {
    // Tema de cores (textos e botões primários)
    "tema": {
      "corBotao": "#c59d5f",
      "fonteTexto": "Inter",
      "corPrimaria": "#c59d5f",
      "fonteTitulo": "Poppins",
      "corSecundaria": "#ffffff",  // ← Se quiser customizar
      "corTexto": "#333333",       // ← Se quiser customizar
      "corBorda": "#e9e9e9",       // ← Se quiser customizar
      "corFundo": "#ffffff"        // ← Se quiser customizar
    },
    
    // ✨ NOVO: Design System (cores, espaçamentos, dimensões)
    "design": {
      // Cores de UI (não relacionadas a texto/botão primário)
      "corFundoPrincipal": "#ffffff",
      "corFundoSecundario": "#f3f3f3",
      "corBordaPrincipal": "#eeeeee",
      "corBordaSecundaria": "#dddddd",
      "corPlaceholder": "#999999",
      "corConfirmado": "#2e7d32",
      "corErro": "#b00020",
      
      // Espaçamentos (padding, margin)
      "spacingPequeno": "8px",
      "spacingMedio": "12px",
      "spacingGrande": "16px",
      "spacingXGrande": "24px",
      
      // Dimensões de container
      "containerMaxWidth": "980px",
      "contentMaxWidth": "520px",
      
      // Border radius
      "borderRadiusPequeno": "6px",
      "borderRadioMedio": "10px",
      "borderRadioGrande": "14px",
      "borderRadioFull": "999px",
      
      // Imagens e media
      "imagemBackgroundFallback": "#f3f3f3",
      "imagemAspectRatio": "16/10",
      
      // Overlays (para sessões com imagem de fundo)
      "overlayOpacityPadrao": "0.45",
      "overlayOpacityMax": "0.75"
    }
  },
  
  "paginas": {
    "presentes": {
      "textos": {
        "titulo": {
          "color": "#c59d5f",
          "scale": "grande",
          "style": "destaque",
          "value": "Escolha um presente 🎁"
        },
        "botaoEscolher": {
          "color": "#ffffff",
          "scale": "normal",
          "style": "padrao",
          "value": "Selecionar"
        }
      },
      // ✨ NOVO: Design específico desta página (sobrescreve o global)
      "design": {
        "corFundoPrincipal": "#f5f5f5"  // Exemplo: fundo mais claro só pra esta página
      }
    },
    
    "introducao": {
      "tema": {
        "corBotao": "#ec9718",
        "corPrimaria": "#100f0f"
      },
      "textos": {
        "titulo": { /* ... */ },
        "texto": { /* ... */ },
        "botaoConfirmar": { /* ... */ },
        "botaoPresentes": { /* ... */ }
      },
      "sessoes": [
        {
          "ativo": true,
          "titulo": { /* ... */ },
          "texto": { /* ... */ },
          "overlay": 0.45,
          "bgImageUrl": "https://..."
        }
        // ... mais 2 sessões
      ],
      // ✨ NOVO: Design específico
      "design": {}
    },
    
    "confirmacao": {
      "textos": { /* ... */ },
      "design": {}
    },
    
    "agradecimento": {
      "textos": { /* ... */ },
      "design": {}
    },
    
    "identificacao": {
      "tema": { /* ... */ },
      "textos": { /* ... */ },
      "imagens": { /* ... */ },
      "design": {}
    },
    
    "meusPresentes": {
      "textos": { /* ... */ },
      "design": {}
    }
  }
}
*/
/*
// Adicione estes campos à tabela "configuracoes" campo "config"

{
  "global": {
    // Tema de cores (textos e botões primários)
    "tema": {
      "corBotao": "#c59d5f",
      "fonteTexto": "Inter",
      "corPrimaria": "#c59d5f",
      "fonteTitulo": "Poppins",
      "corSecundaria": "#ffffff",  // ← Se quiser customizar
      "corTexto": "#333333",       // ← Se quiser customizar
      "corBorda": "#e9e9e9",       // ← Se quiser customizar
      "corFundo": "#ffffff"        // ← Se quiser customizar
    },
    
    // ✨ NOVO: Design System (cores, espaçamentos, dimensões)
    "design": {
      // Cores de UI (não relacionadas a texto/botão primário)
      "corFundoPrincipal": "#ffffff",
      "corFundoSecundario": "#f3f3f3",
      "corBordaPrincipal": "#eeeeee",
      "corBordaSecundaria": "#dddddd",
      "corPlaceholder": "#999999",
      "corConfirmado": "#2e7d32",
      "corErro": "#b00020",
      
      // Espaçamentos (padding, margin)
      "spacingPequeno": "8px",
      "spacingMedio": "12px",
      "spacingGrande": "16px",
      "spacingXGrande": "24px",
      
      // Dimensões de container
      "containerMaxWidth": "980px",
      "contentMaxWidth": "520px",
      
      // Border radius
      "borderRadiusPequeno": "6px",
      "borderRadioMedio": "10px",
      "borderRadioGrande": "14px",
      "borderRadioFull": "999px",
      
      // Imagens e media
      "imagemBackgroundFallback": "#f3f3f3",
      "imagemAspectRatio": "16/10",
      
      // Overlays (para sessões com imagem de fundo)
      "overlayOpacityPadrao": "0.45",
      "overlayOpacityMax": "0.75"
    }
  },
  
  "paginas": {
    "presentes": {
      "textos": {
        "titulo": {
          "color": "#c59d5f",
          "scale": "grande",
          "style": "destaque",
          "value": "Escolha um presente 🎁"
        },
        "botaoEscolher": {
          "color": "#ffffff",
          "scale": "normal",
          "style": "padrao",
          "value": "Selecionar"
        }
      },
      // ✨ NOVO: Design específico desta página (sobrescreve o global)
      "design": {
        "corFundoPrincipal": "#f5f5f5"  // Exemplo: fundo mais claro só pra esta página
      }
    },
    
    "introducao": {
      "tema": {
        "corBotao": "#ec9718",
        "corPrimaria": "#100f0f"
      },
      "textos": {
        "titulo": { /* ... */ },
        "texto": { /* ... */ },
        "botaoConfirmar": { /* ... */ },
        "botaoPresentes": { /* ... */ }
      },
      "sessoes": [
        {
          "ativo": true,
          "titulo": { /* ... */ },
          "texto": { /* ... */ },
          "overlay": 0.45,
          "bgImageUrl": "https://..."
        }
        // ... mais 2 sessões
      ],
      // ✨ NOVO: Design específico
      "design": {}
    },
    
    "confirmacao": {
      "textos": { /* ... */ },
      "design": {}
    },
    
    "agradecimento": {
      "textos": { /* ... */ },
      "design": {}
    },
    
    "identificacao": {
      "tema": { /* ... */ },
      "textos": { /* ... */ },
      "imagens": { /* ... */ },
      "design": {}
    },
    
    "meusPresentes": {
      "textos": { /* ... */ },
      "design": {}
    }
  }
}

/**
 * ⚠️ IMPORTANTE:
 * 
 * 1. O campo "design" é OPCIONAL em cada página
 *    Se não existir, usa-se os valores do global.design
 * 
 * 2. Os valores em "design" can ser:
 *    - Cores: string hexadecimal (#ffffff)
 *    - Espaçamentos: string com unidade (12px, 1rem, etc)
 *    - Números: para opacity (0.45)
 * 
 * 3. Sempre há fallbacks seguros, então mesmo que deixe vazio,
 *    a UI continua funcionando com bons padrões
 * 
 * 4. Para atualizar qualquer estilo:
 *    - Edite este JSON
 *    - Salve na tabela configuracoes
 *    - A UI carrega automaticamente (sem de redeploy)
 */
