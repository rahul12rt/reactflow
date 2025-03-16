import { BaseEdge, getBezierPath } from "reactflow";

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} />
      <foreignObject
        x={labelX - 10}
        y={labelY - 10}
        width={20}
        height={20}
        style={{ cursor: "pointer", zIndex: 10 }}
      >
        <div
          style={{
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            border: "2px solid white",
          }}
          onClick={() => data.onDelete(id)}
        >
          X
        </div>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
