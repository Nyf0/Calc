class Calculator {
    constructor() {
        this.expression = '';
        this.history = [];
        this.theme = localStorage.getItem('calculator-theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.target.getAttribute('data-value');
                this.handleButtonClick(value);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    handleButtonClick(value) {
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

    handleKeyboard(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.()'.includes(key)) {
            e.preventDefault();
            this.appendToExpression(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape' || key === 'Delete') {
            e.preventDefault();
            this.clearAll();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.deleteLast();
        } else if (key === 's' && e.ctrlKey) {
            e.preventDefault();
            this.appendToExpression('sin(');
        } else if (key === 'c' && e.ctrlKey) {
            e.preventDefault();
            this.appendToExpression('cos(');
        } else if (key === 't' && e.ctrlKey) {
            e.preventDefault();
            this.appendToExpression('tan(');
        }
        
        this.updateDisplay();
    }

    appendToExpression(value) {
        if (this.expression === 'Error') {
            this.expression = '';
        }
        this.expression += value;
    }

    deleteLast() {
        this.expression = this.expression.slice(0, -1);
    }

    clearAll() {
        this.expression = '';
        this.history = [];
        this.updateHistoryDisplay();
    }

    calculate() {
        if (!this.expression) return;

        try {
            // Replace display symbols with math.js compatible symbols
            let mathExpression = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');

            const result = math.evaluate(mathExpression);
            const calculation = `${this.expression} = ${result}`;
            
            this.history.unshift(calculation);
            if (this.history.length > 5) {
                this.history.pop();
            }
            
            this.expression = result.toString();
            this.updateHistoryDisplay();
        } catch (error) {
            this.expression = 'Error';
            setTimeout(() => {
                if (this.expression === 'Error') {
                    this.expression = '';
                    this.updateDisplay();
                }
            }, 1500);
        }
    }

    updateDisplay() {
        document.getElementById('expression').textContent = this.expression || '0';
        document.getElementById('result').textContent = this.expression || '0';
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('history');
        
        if (this.history.length === 0) {
            historyElement.style.display = 'none';
            return;
        }

        historyElement.style.display = 'block';
        historyElement.innerHTML = '<div style="font-weight: 600; margin-bottom: 4px; font-size: 0.7rem;">History</div>' +
            this.history.map(item => 
                `<div class="history-item" onclick="calculator.loadFromHistory('${item.split(' = ')[0]}')">${item}</div>`
            ).join('');
    }

    loadFromHistory(expression) {
        this.expression = expression;
        this.updateDisplay();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('calculator-theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        
        if (this.theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark';
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});