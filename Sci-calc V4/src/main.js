class Calculator {
    constructor() {
        this.expression = '';
        this.history = [];
        this.theme = localStorage.getItem('calculator-theme') || 'light';
        this.init();
    }

    init() {
        console.log('Calculator initializing...');
        this.applyTheme();
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.target.getAttribute('data-value');
                console.log('Button clicked:', value);
                this.handleButtonClick(value);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            console.log('Theme toggle clicked');
            this.toggleTheme();
        });

        // Enhanced keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        console.log('Events bound successfully');
    }

    handleKeyboard(e) {
        const key = e.key;
        console.log('Key pressed:', key);
        
        // Prevent default for all calculator keys
        e.preventDefault();
        
        const keyMap = {
            // Numbers
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
            
            // Basic operators
            '+': '+', '-': '-', '*': '*', '/': '/',
            '.': '.', 
            '(': '(', ')': ')',
            
            // Enter and equals
            'Enter': '=', '=': '=',
            
            // Clear keys
            'Escape': 'AC', 'Delete': 'AC', 'Backspace': 'DEL',
            
            // Alternative key mappings
            'c': 'AC',    // Ctrl+C is handled separately
            'C': 'AC'
        };

        // Handle Ctrl combinations
        if (e.ctrlKey) {
            switch(key) {
                case 'c': // Copy
                case 'C':
                    navigator.clipboard.writeText(this.expression).catch(console.error);
                    return;
                case 'v': // Paste
                case 'V':
                    navigator.clipboard.readText().then(text => {
                        // Sanitize pasted text to only allow calculator characters
                        const sanitized = text.replace(/[^0-9+\-*/().]/g, '');
                        this.expression += sanitized;
                        this.updateDisplay();
                    }).catch(console.error);
                    return;
            }
        }

        // Handle function keys with Shift
        if (e.shiftKey) {
            switch(key) {
                case 'S': this.appendToExpression('sin('); return;
                case 'C': this.appendToExpression('cos('); return;
                case 'T': this.appendToExpression('tan('); return;
                case 'L': this.appendToExpression('log('); return;
                case 'R': this.appendToExpression('sqrt('); return;
            }
        }

        // Handle the key if it's in our map
        if (keyMap[key] !== undefined) {
            this.handleButtonClick(keyMap[key]);
            this.provideVisualFeedback(keyMap[key]);
        }
        
        // Handle function keys without Shift (using special characters)
        switch(key) {
            case 's': this.appendToExpression('sin('); break;
            case 'c': this.appendToExpression('cos('); break;
            case 't': this.appendToExpression('tan('); break;
            case 'l': this.appendToExpression('log('); break;
            case 'r': this.appendToExpression('sqrt('); break;
            case 'q': this.appendToExpression('sqrt('); break; // q for square root
        }
    }

    provideVisualFeedback(value) {
        // Find the button that corresponds to this value and add a visual effect
        const button = document.querySelector(`[data-value="${value}"]`);
        if (button) {
            button.classList.add('key-press');
            setTimeout(() => {
                button.classList.remove('key-press');
            }, 150);
        }
    }

    handleButtonClick(value) {
        console.log('Handling button:', value);
        
        switch(value) {
            case 'AC':
                this.clearAll();
                break;
            case 'DEL':
                this.deleteLast();
                break;
            case '=':
                this.calculate();
                break;
            default:
                this.appendToExpression(value);
        }
        this.updateDisplay();
    }

    appendToExpression(value) {
        if (this.expression === 'Error') {
            this.expression = '';
        }
        this.expression += value;
        console.log('Expression updated:', this.expression);
    }

    deleteLast() {
        this.expression = this.expression.slice(0, -1);
        console.log('Deleted last character:', this.expression);
    }

    clearAll() {
        this.expression = '';
        this.history = [];
        this.updateHistoryDisplay();
        console.log('Cleared all');
    }

    calculate() {
        if (!this.expression) return;

        try {
            let result;
            try {
                // Enhanced evaluation with better error handling
                const cleanExpression = this.expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/sqrt\(/g, 'Math.sqrt(');

                // Safety check - only allow safe math operations
                if (!/^[0-9+\-*/(). Math.sincostanlog10sqrt]*$/.test(cleanExpression)) {
                    throw new Error('Invalid characters');
                }

                result = eval(cleanExpression);
                
                // Handle division by zero and other edge cases
                if (!isFinite(result)) {
                    throw new Error('Invalid calculation');
                }
            } catch (e) {
                result = 'Error';
            }
            
            const calculation = `${this.expression} = ${result}`;
            
            this.history.unshift(calculation);
            if (this.history.length > 5) {
                this.history.pop();
            }
            
            this.expression = result.toString();
            this.updateHistoryDisplay();
            console.log('Calculation result:', result);
        } catch (error) {
            this.expression = 'Error';
            console.error('Calculation error:', error);
            setTimeout(() => {
                if (this.expression === 'Error') {
                    this.expression = '';
                    this.updateDisplay();
                }
            }, 1500);
        }
    }

    updateDisplay() {
        const expressionElement = document.getElementById('expression');
        const resultElement = document.getElementById('result');
        
        if (expressionElement && resultElement) {
            expressionElement.textContent = this.expression || '0';
            resultElement.textContent = this.expression || '0';
        } else {
            console.error('Display elements not found!');
        }
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('history');
        
        if (!historyElement) {
            console.error('History element not found!');
            return;
        }

        if (this.history.length === 0) {
            historyElement.style.display = 'none';
            return;
        }

        historyElement.style.display = 'block';
        historyElement.innerHTML = '<div style="font-weight: 600; margin-bottom: 4px; font-size: 0.7rem;">History</div>' +
            this.history.map(item => 
                `<div class="history-item" onclick="calculator.loadFromHistory('${item.split(' = ')[0].replace(/'/g, "\\'")}')">${item}</div>`
            ).join('');
    }

    loadFromHistory(expression) {
        this.expression = expression;
        this.updateDisplay();
    }

    toggleTheme() {
        console.log('Toggling theme from:', this.theme);
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('calculator-theme', this.theme);
        console.log('Theme toggled to:', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        
        if (themeIcon && themeText) {
            if (this.theme === 'dark') {
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light';
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark';
            }
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing calculator...');
    window.calculator = new Calculator();
});

// Add CSS for keyboard feedback
const style = document.createElement('style');
style.textContent = `
    .key-press {
        transform: scale(0.95) !important;
        opacity: 0.8 !important;
        transition: all 0.1s ease !important;
    }
`;
document.head.appendChild(style);