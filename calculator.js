class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
    }

    clearEntry() {
        this.currentOperand = '0';
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        // Если экран был сброшен (после вычисления), начинаем заново
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        // Предотвращаем несколько десятичных точек
        if (number === '.' && this.currentOperand.includes('.')) {
            return;
        }

        // Предотвращаем множественные нули в начале (кроме "0." или "0.5")
        if (number === '0' && this.currentOperand === '0') {
            return;
        }

        // Если текущее значение "0" и добавляется не точка, заменяем ноль
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }

        // Ограничиваем длину числа для предотвращения переполнения
        if (this.currentOperand.length > 15) {
            this.currentOperand = this.currentOperand.slice(0, 15);
        }
    }

    chooseOperation(operation) {
        // Если предыдущий операнд существует и операция уже была выбрана, вычисляем
        if (this.previousOperand !== '' && this.operation) {
            this.compute();
        }

        // Если текущий операнд пуст или равен "0", не меняем операцию
        if (this.currentOperand === '0' || this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
                this.updateDisplay();
            }
            return;
        }

        // Сохраняем текущий операнд как предыдущий
        this.previousOperand = this.currentOperand;
        this.operation = operation;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Проверка на валидность чисел
        if (isNaN(prev) || isNaN(current)) {
            return;
        }

        // Если операция не выбрана, не вычисляем
        if (!this.operation) {
            return;
        }

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                // Обработка деления на ноль
                if (current === 0) {
                    this.currentOperand = 'Ошибка';
                    this.previousOperand = '';
                    this.operation = null;
                    this.shouldResetScreen = true;
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Проверка на переполнение
        if (!isFinite(computation)) {
            this.currentOperand = 'Ошибка';
            this.previousOperand = '';
            this.operation = null;
            this.shouldResetScreen = true;
            this.updateDisplay();
            return;
        }

        // Округляем результат для избежания проблем с плавающей точкой
        computation = Math.round(computation * 100000000000000) / 100000000000000;

        // Форматируем результат
        this.currentOperand = this.formatNumber(computation);
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        if (number === 'Ошибка' || number === 'Не определено') {
            return number;
        }

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('ru-RU', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    formatNumber(number) {
        // Проверка на ошибки
        if (typeof number === 'string' && (number === 'Ошибка' || number === 'Не определено')) {
            return number;
        }

        const num = parseFloat(number);
        
        // Проверка на NaN или Infinity
        if (isNaN(num) || !isFinite(num)) {
            return 'Ошибка';
        }

        const stringNumber = num.toString();
        
        // Если число слишком большое, возвращаем в экспоненциальной форме
        if (stringNumber.length > 15) {
            return num.toExponential(10);
        }

        return stringNumber;
    }

    toggleSign() {
        if (this.currentOperand === '0' || this.currentOperand === '' || 
            this.currentOperand === 'Ошибка' || this.currentOperand === 'Не определено') {
            return;
        }

        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    getOperationSymbol(operation) {
        const symbols = {
            '+': '+',
            '−': '−',
            '×': '×',
            '÷': '÷'
        };
        return symbols[operation] || operation;
    }
}

// Инициализация калькулятора
const previousOperandElement = document.querySelector('[data-previous-operand]');
const currentOperandElement = document.querySelector('[data-current-operand]');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Обработка кликов по кнопкам
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

document.querySelectorAll('[data-operation]').forEach(button => {
    button.addEventListener('click', () => {
        const operation = button.getAttribute('data-operation');
        
        if (operation === 'clear') {
            calculator.clear();
        } else if (operation === 'clear-entry') {
            calculator.clearEntry();
        } else if (operation === 'backspace') {
            calculator.delete();
        } else if (operation === '±') {
            calculator.toggleSign();
        } else if (operation === '=') {
            calculator.compute();
        } else {
            calculator.chooseOperation(operation);
        }
        
        calculator.updateDisplay();
    });
});

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    // Предотвращаем стандартное поведение для цифр и операторов
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    } else if (e.key === '+' || e.key === '-') {
        calculator.chooseOperation(e.key === '+' ? '+' : '−');
        calculator.updateDisplay();
    } else if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    } else if (e.key === '/') {
        e.preventDefault(); // Предотвращаем поиск в браузере
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
        calculator.updateDisplay();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        calculator.clear();
        calculator.updateDisplay();
    } else if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    } else if (e.key === 'Delete') {
        calculator.clearEntry();
        calculator.updateDisplay();
    }
});

// Инициализация отображения
calculator.updateDisplay();

