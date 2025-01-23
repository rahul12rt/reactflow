import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BASE_URL } from "../../config";
import { ToastQueue} from '@react-spectrum/toast'
import {
  ActionButton,
  Button,
  ButtonGroup,
  Checkbox,
  Content,
  defaultTheme,
  Dialog,
  DialogTrigger,
  Divider,
  Flex,
  Footer,
  Form,
  Header,
  Heading,
  Link,
  Provider,
  Text,
  TextField,
} from "@adobe/react-spectrum";

function GetToken(props) {
  const [formState, setFormState] = useState({
    clientId: "",
    secretId: "",
    error: "",
  });

  const label = props.data?.label;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { clientId, secretId } = formState;
    if (!clientId.trim() || !secretId.trim()) {
      setFormState((prevState) => ({
        ...prevState,
        error: "Both Client ID and Secret ID are required.",
      }));
      return;
    }

    setFormState((prevState) => ({ ...prevState, error: "" }));

    try {
      ToastQueue.info('Generating a token')
      const response = await axios.post(`${BASE_URL}proxy/token`, {
        client_id: clientId,
        client_secret: secretId,
        grant_type: "client_credentials",
        scope:
          "openid,AdobeID,firefly_enterprise,firefly_api,session,additional_info,ff_apis",
      });
      props.setUserData((prev) => ({
        ...prev,
        auth: { token: response.data, clientId: formState.clientId },
      }));
      ToastQueue.positive('Token generated successfully!')
    } catch (error) {
      console.error("API Error:", error);
      ToastQueue.negative('Failed to fetch token. Please try again.')
    }
  };

  return (
    // <section className="wrapper">
    // <div className="container">
    //   <h1 className="header" style={{background:"#308FFD"}}>Generate Token</h1>
    //   <div className="body">
    //     <div style={{textAlign:"left"}}>
    //     <label style={{paddingBottom:4, display:"block"}}>Client Id</label>
    //     <input
    //       type="text"
    //       name="clientId"
    //       value={formState.clientId}
    //       onChange={handleInputChange}
    //       className="input"
    //     />
    //     </div>
    //     <div style={{textAlign:"left"}}>
    //     <label>Client Secret</label>
    //     <input
    //       type="text"
    //       name="secretId"
    //       value={formState.secretId}
    //       onChange={handleInputChange}
    //       className="input"
    //     />
    //         </div>
    //     {formState.error && <p className="error">{formState.error}</p>}
    //     <Button
    //       variant="accent"
    //       onPress={handleSubmit}
    //     >
    //       Generate Token
    //     </Button>
    //   </div>
    // </div>
    // </section>
    <DialogTrigger>
  <ActionButton>Register</ActionButton>
  {(close) => (
    <Dialog>
      <Heading>
        <Flex alignItems="center" gap="size-100">
          <Text>
            Register for newsletter
          </Text>
        </Flex>
      </Heading>
      <Header>
        <Link>
          <a href="//example.com" target="_blank">What is this?</a>
        </Link>
      </Header>
      <Divider />
      <Content>
        <Form>
          <TextField label="First Name" autoFocus />
          <TextField label="Last Name" />
          <TextField label="Street Address" />
          <TextField label="City" />
        </Form>
      </Content>
      <Footer>
        <Checkbox>
          I want to receive updates for exclusive offers in my area.
        </Checkbox>
      </Footer>
      <ButtonGroup>
        <Button variant="secondary" onPress={close}>Cancel</Button>
        <Button variant="accent" onPress={close}>Register</Button>
      </ButtonGroup>
    </Dialog>
  )}
</DialogTrigger>
  );
}

GetToken.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default GetToken;
