"use client";
import { useState } from "react";
import { evaluate } from "mathjs";

export default function Home() {
  const [expression, setExpression] = useState("");
  const [theme, setTheme] = useState("light");

  const handleClick = (value) => {
    if (value === "C") setExpression("");
    else if (value === "=") {
      try {
        const result = evaluate(expression);
        setExpression(result.toString());
      } catch {
        setExpression("Error");
      }
    } else {
      setExpression(expression + value);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const buttons = [
    "7", "8", "9", "/", "sin(",
    "4", "5", "6", "*", "cos(",
    "1", "2", "3", "-", "tan(",
    "0", ".", "(", ")", "+",
    "log(", "sqrt(", "C", "="
  ];

  return (
    <div className={`${theme} min-h-screen flex items-center justify-center transition-colors duration-300`}>
      <div className={`p-6 rounded-2xl shadow-2xl w-80 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Scientific Calculator</h1>
          <button
            onClick={toggleTheme}
            className="text-sm px-2 py-1 border rounded-lg"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <div className="bg-black text-green-400 font-mono p-3 mb-4 rounded text-right h-12 overflow-x-auto">
          {expression || "0"}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleClick(btn)}
              className={`p-3 rounded-lg font-semibold hover:opacity-80 ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
