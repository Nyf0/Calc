"use client";
import { useState, useCallback } from "react";
import { evaluate } from "mathjs";

type Theme = "light" | "dark" | "system";
type ButtonType = "number" | "operator" | "function" | "clear" | "equals";

interface CalculatorButton {
  label: string;
  value: string;
  type: ButtonType;
  colSpan?: number;
}

export default function Home() {
  const [expression, setExpression] = useState("");
  const [theme, setTheme] = useState<Theme>("system");
  const [history, setHistory] = useState<string[]>([]);

  const getActiveTheme = (): "light" | "dark" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };

  const handleClick = useCallback((value: string) => {
    if (value === "C") {
      setExpression("");
    } else if (value === "=") {
      try {
        const result = evaluate(expression);
        const calculation = `${expression} = ${result}`;
        setExpression(result.toString());
        setHistory(prev => [calculation, ...prev.slice(0, 4)]);
      } catch {
        setExpression("Error");
        setTimeout(() => setExpression(""), 1500);
      }
    } else if (value === "DEL") {
      setExpression(prev => prev.slice(0, -1));
    } else if (value === "AC") {
      setExpression("");
      setHistory([]);
    } else {
      setExpression(prev => prev + value);
    }
  }, [expression]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return "light";
    });
  };

  const getButtonClasses = (type: ButtonType, colSpan?: number) => {
    const baseClasses = "p-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 ";
    const spanClass = colSpan ? `col-span-${colSpan}` : "";
    
    const activeTheme = getActiveTheme();
    const isDark = activeTheme === "dark";

    const typeClasses = {
      number: isDark 
        ? "bg-gray-700 hover:bg-gray-600 text-white focus:ring-blue-400" 
        : "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-blue-500",
      operator: isDark 
        ? "bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-400" 
        : "bg-blue-500 hover:bg-blue-400 text-white focus:ring-blue-300",
      function: isDark 
        ? "bg-purple-600 hover:bg-purple-500 text-white focus:ring-purple-400" 
        : "bg-purple-500 hover:bg-purple-400 text-white focus:ring-purple-300",
      clear: isDark 
        ? "bg-red-600 hover:bg-red-500 text-white focus:ring-red-400" 
        : "bg-red-500 hover:bg-red-400 text-white focus:ring-red-300",
      equals: isDark 
        ? "bg-green-600 hover:bg-green-500 text-white focus:ring-green-400" 
        : "bg-green-500 hover:bg-green-400 text-white focus:ring-green-300",
    };

    return `${baseClasses} ${spanClass} ${typeClasses[type]}`;
  };

  const buttons: CalculatorButton[] = [
    { label: "sin", value: "sin(", type: "function" },
    { label: "cos", value: "cos(", type: "function" },
    { label: "tan", value: "tan(", type: "function" },
    { label: "log", value: "log(", type: "function" },
    { label: "√", value: "sqrt(", type: "function" },
    
    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" },
    { label: "÷", value: "/", type: "operator" },
    { label: "DEL", value: "DEL", type: "clear" },
    
    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" },
    { label: "×", value: "*", type: "operator" },
    { label: "(", value: "(", type: "operator" },
    
    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" },
    { label: "-", value: "-", type: "operator" },
    { label: ")", value: ")", type: "operator" },
    
    { label: "0", value: "0", type: "number" },
    { label: ".", value: ".", type: "number" },
    { label: "AC", value: "AC", type: "clear", colSpan: 2 },
    { label: "+", value: "+", type: "operator" },
    
    { label: "=", value: "=", type: "equals", colSpan: 5 },
  ];

  const activeTheme = getActiveTheme();
  const themeIcon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return (
    <div className={`${activeTheme} min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-gradient-to-br ${
      activeTheme === "dark" 
        ? "from-gray-900 to-gray-800" 
        : "from-blue-50 to-gray-100"
    }`}>
      <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md ${
        activeTheme === "dark" 
          ? "bg-gray-800 text-white shadow-gray-900" 
          : "bg-white text-gray-900 shadow-gray-200"
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Scientific Calculator
          </h1>
          <button
            onClick={toggleTheme}
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              activeTheme === "dark" 
                ? "bg-gray-700 hover:bg-gray-600 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label={`Switch theme, current: ${theme}`}
          >
            <span className="flex items-center gap-2">
              {themeIcon} {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </span>
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-opacity-50 max-h-20 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2 opacity-70">History</h3>
            {history.map((item, index) => (
              <div 
                key={index} 
                className="text-xs opacity-60 truncate"
                onClick={() => setExpression(item.split(' = ')[0])}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Display */}
        <div className={`font-mono p-4 mb-4 rounded-lg text-right min-h-[4rem] flex flex-col justify-end overflow-x-auto ${
          activeTheme === "dark" 
            ? "bg-gray-900 text-green-400" 
            : "bg-gray-100 text-green-700"
        }`}>
          <div className="text-sm opacity-60 truncate">
            {expression || "0"}
          </div>
          <div className="text-lg font-semibold truncate">
            {expression || "0"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-3">
          {buttons.map((button) => (
            <button
              key={button.value}
              onClick={() => handleClick(button.value)}
              className={getButtonClasses(button.type, button.colSpan)}
              aria-label={button.label}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm opacity-60">
          Powered by Next.js & Math.js
        </div>
      </div>
    </div>
  );
}