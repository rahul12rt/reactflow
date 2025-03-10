import { Handle } from "reactflow";
import { FaEdit, FaSave } from "react-icons/fa";
import { useState } from "react";

const CustomCardNode = ({ data }) => {
  console.log("Data:", data);

  if (!data || !data.children || data.children.length === 0) {
    return <div className="card">No Data</div>;
  }

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTexts, setEditedTexts] = useState(
    data.children.map((child) =>
      child.type === "textLayer" && child.text?.content ? child.text.content : ""
    )
  );

  const handleSave = (index) => {
    setEditingIndex(null);
    data.setEditedText && data.setEditedText(editedTexts[index]);

    if (data.updateNodeData) {
      const updatedChildren = data.children.map((child, i) =>
        i === index ? { ...child, editedText: editedTexts[i] } : child
      );
      data.updateNodeData(data.id, { children: updatedChildren });
    }
  };

  return (
    <div className="card">
      {data.children.map((child, index) => (
        <div key={index} className="cardContainer">
          {child.type === "textLayer" && (
            <>
              <p className="edit">
                {editingIndex === index ? (
                  <span onClick={() => handleSave(index)} style={{ cursor: "pointer" }}>
                    Save <FaSave style={{ marginLeft: "5px" }} />
                  </span>
                ) : (
                  <span onClick={() => setEditingIndex(index)} style={{ cursor: "pointer" }}>
                    Edit <FaEdit style={{ marginLeft: "5px" }} />
                  </span>
                )}
              </p>
              <div>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedTexts[index]}
                    onChange={(e) =>
                      setEditedTexts((prev) => {
                        const newTexts = [...prev];
                        newTexts[index] = e.target.value;
                        return newTexts;
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <span>{editedTexts[index]}</span>
                )}
              </div>
            </>
          )}

          {child.type === "smartObject" && <img src={child.thumbnail} alt={child.name} />}
          {child.type !== "textLayer" && child.type !== "smartObject" && (
            <img src={child.thumbnail} alt={child.name} />
          )}
        </div>
      ))}

      <Handle type="target" position="left" id="default" />
      <Handle type="source" position="right" id="default" />
    </div>
  );
};

export default CustomCardNode;
