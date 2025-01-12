import { Handle } from "reactflow";
import { FaEdit, FaSave } from "react-icons/fa"; 
import { useState } from "react";

const CustomCardNode = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.child.name); 


  const handleSave = () => {
    setIsEditing(false);
    data.setEditedText(text)
      if (data.updateNodeData) {
      data.updateNodeData(data.id, { child: { ...data.child, editedText: text } });
    }
  };

  return (
    <div className="card">
      {data.child.type === "textLayer" && (
        <div className="cardContianer">
          <p className="edit">
            {isEditing ? (
              <span onClick={handleSave} style={{ cursor: "pointer" }}>
                Save <FaSave style={{ marginLeft: "5px" }} />
              </span>
            ) : (
              <span onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
                Edit <FaEdit style={{ marginLeft: "5px" }} />
              </span>
            )}
          </p>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <span>{text}</span>
            )}
          </div>
        </div>
      )}

      {data.child.type === "smartObject" && (
        <img src={data.child.thumbnail} alt={data.child.name} />
      )}

      {data.child.type !== "textLayer" && data.child.type !== "smartObject" && (
        <img src={data.child.thumbnail} alt={data.child.name} />
      )}

      <Handle type="target" position="left" id="default" />
      <Handle type="source" position="right" id="default" />
    </div>
  );
};

export default CustomCardNode;
