
import React from "react";

import {
    Box,
    Flex,
    Image,
    Card,
    Heading,
    Link,
    Form,
    Input,
    Select,
    Field,
    Button,
    Text,
    Checkbox,
    Radio
  } from "rimble-ui";

import { Link as Router_Link } from "react-router-dom";

const Menus = (props) => {
    console.log("props=", props)

    let userRole = props.userRole;

    return (
        <Card width={"auto"} mx={"auto"} px={[3, 3, 4]}>
            <Heading>Menu</Heading>

            <Box pt={3}>
                {userRole===1 && (
                    <Box>
                        <Router_Link to="/userconfig">
                            <Text fontSize="large" title="This link goes supplier page">
                                User Config
                            </Text>
                        </Router_Link>
                    </Box>
                )}

                {userRole===2 && (
                    <Box>
                        <Router_Link to="/supplier">
                            <Text fontSize="large" title="This link goes supplier page">
                                Supplier
                            </Text>
                        </Router_Link>
                    </Box>
                )}

                {userRole===3 && (
                    <Box>
                        <Router_Link to="/manufacturer">
                            <Text fontSize="large" title="This link goes manufacturer page">
                                Manufacturer
                            </Text>
                        </Router_Link>
                    </Box>
                )}

                <Box>
                    <Router_Link to="/monitor">
                        <Text fontSize="large" title="This link goes manufacturer page">
                            Monitor
                        </Text>
                    </Router_Link>
                </Box>
            </Box>
        </Card>
    );
};

export default Menus;
  


