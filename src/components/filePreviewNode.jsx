import { Position } from "@xyflow/react";
import { Handle } from "reactflow";
import styles from "./dataService/index.module.css";
import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Flex,
  Heading,
  Text,
} from "@adobe/react-spectrum";
import { useState } from "react";

const FilePreviewNode = ({ data }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClick = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <div
        className={`${styles.container}`}
        onClick={handleClick}
        style={{ background: "#fff" }}
      >
        <img src="/logo/icons8-preview-60.png" alt="folder" className={styles.icon} style={{width: "100%", height: "100%"}}/>
      </div>

      <div className={styles.textContainer}>
        <p className={styles.subTitle}>Preview Document</p>
      </div>

      <DialogTrigger isOpen={dialogOpen} onClose={closeDialog}>
        <div style={{ visibility: "hidden" }}>
          <ActionButton>Create</ActionButton>
        </div>
        {(close) => (
          <Dialog>
            <Heading>
              <Flex alignItems="center" gap="size-100">
                <Text>File Preview</Text>
              </Flex>
            </Heading>
            <Divider />
            <Content>
              {data.url && (
                <img
                  src={data.url}
                  alt="File Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              )}
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={closeDialog}>
                Cancel
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default FilePreviewNode;
