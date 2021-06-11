
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

const Menus = () => {
    return (
        <Card width={"auto"} mx={"auto"} px={[3, 3, 4]}>
            <Heading>Menu</Heading>

            <Box pt={3}>
                <Box>
                    <Router_Link to="/supplier">
                        <Link fontSize="large" href="#!" title="This link goes supplier page">
                            Supplier
                        </Link>
                    </Router_Link>
                </Box>
                <Box>
                    <Router_Link to="/manufacturer">
                        <Link fontSize="large" href="#!" title="This link goes manufacturer page">
                            Manufacturer
                        </Link>
                    </Router_Link>
                </Box>
                <Box>
                    <Router_Link to="/tracker">
                        <Link fontSize="large" href="#!" title="This link goes manufacturer page">
                            Tracker
                        </Link>
                    </Router_Link>
                </Box>
            </Box>
        </Card>
    );
};

export default Menus;
  


