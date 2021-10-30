import {ReactNode} from "react";
import {Flex} from "@chakra-ui/react";

type Props = {
    children?: ReactNode;
};

export default function Layout({children}: Props) {
    return (
        <Flex
        >
            {children}
        </Flex>
    );
}
