import React, { useState } from "react";
import styles from "./index.module.css";

function Header({ options, handleSelectChange, selectedValue }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value) => {
    handleSelectChange({ target: { value } });
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <img src="/adobe-logo.svg" alt="Adobe Logo" width={68} />

      {/* Dropdown Menu */}
      <div className={styles.selectContainer}>
        <div
          className={`${styles.customSelect} ${isOpen ? styles.active : ""}`}
          onClick={handleToggle}
        >
          {selectedValue || "Select Node"}
        </div>
        {isOpen && (
          <ul className={styles.options}>
            {options.map((option) => (
              <li
                key={option.value}
                className={styles.option}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Header;
