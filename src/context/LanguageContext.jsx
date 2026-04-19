import React, { useEffect, useState, createContext, useContext } from 'react';
import toast from 'react-hot-toast';

// Monkey patch to prevent React crashes when Google Translate mutates the DOM
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child && child.parentNode !== this) {
      if (console) console.warn('Caught conflicting removeChild from outside React');
      return child; 
    }
    return originalRemoveChild.apply(this, arguments);
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) console.warn('Caught conflicting insertBefore from outside React');
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('preferredLang') || 'en');
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        // Embed Google Translate Script securely
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'hi,en',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            };
            
            document.body.appendChild(addScript);
        }

        // Maintain accessibility classes
        if (language === 'hi') {
            document.body.classList.add('hindi-mode');
        } else {
            document.body.classList.remove('hindi-mode');
        }

        // Trigger Google Translate engine programmatically
        const attemptTranslate = () => {
            const selectField = document.querySelector('.goog-te-combo');
            if (selectField) {
                selectField.value = language;
                selectField.dispatchEvent(new Event('change'));
            } else {
                setTimeout(attemptTranslate, 400);
            }
        };

        setTimeout(attemptTranslate, 100);

    }, [language]);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'hi' : 'en';
        setLanguage(newLang);
        localStorage.setItem('preferredLang', newLang);
        
        // Add a cookie for Google Translate to lock preferred language natively
        document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname}`;
        window.location.reload(); // Refresh the DOM cleanly to apply massive translation changes
    };

    const playTextToSpeech = () => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }

            window.speechSynthesis.cancel();
            
            const contentBlock = document.querySelector('.app-container') || document.body;
            // Clean out HTML tags, grab plain Hindi/English text, slice first 1000 characters
            let textToRead = contentBlock.innerText.substring(0, 1000); 
            
            if (!textToRead) return;
            toast.success(language === 'hi' ? 'पृष्ठ को ज़ोर से पढ़ रहा है...' : 'Reading page aloud...');

            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            utterance.rate = 0.85; // Slower for comprehension
            utterance.pitch = 1.0;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
        } else {
            toast.error('Text-to-speech not supported.');
        }
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, playTextToSpeech, isSpeaking }}>
            {/* Hidden anchor for Google Translate widget creation */}
            <div id="google_translate_element" style={{ display: 'none', height: 0, width: 0, visibility: 'hidden' }}></div>
            {children}
        </LanguageContext.Provider>
    );
};
