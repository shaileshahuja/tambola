import {
    Accordion, AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Heading,
    StackDivider,
    Text,
    VStack
} from "@chakra-ui/react";

export default function FAQ() {
    let playQuestions = []
    for(let entry of playFAQs) {
        playQuestions.push(
            (
                <Question question={entry.question} answer={entry.answer}/>
            )
        )
    }
    let hostQuestions = []
    for(let entry of hostFAQs) {
        hostQuestions.push(
            (
                <Question question={entry.question} answer={entry.answer}/>
            )
        )
    }
    return (
        <Accordion allowToggle>
          <AccordionItem>
              <AccordionButton>
                <Heading textAlign="left" size='sm'>
                  Play FAQs
                </Heading>
                <AccordionIcon />
              </AccordionButton>
            <AccordionPanel pb={4}>
                {playQuestions}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
              <AccordionButton>
                <Heading textAlign="left"  size='sm'>
                  Host FAQs
                </Heading>
                <AccordionIcon />
              </AccordionButton>
            <AccordionPanel pb={4}>
                {hostQuestions}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
    )
}

function Question(props: {question: string, answer: string}) {
    let {question, answer} = props
    return (
        <VStack align="left">
            <Heading size={'md'}>
                {question}
            </Heading>
            <Text color="gray.500">
                {answer}
            </Text>
        </VStack>
        )
}

const playFAQs = [
    {
        'question': "How do I buy a ticket?",
        'answer': "You need a host wallet address to join that game and buy a ticket. " +
            "Please enter the host address in the 'Play' tab."
    },
    {
        'question': "How do find a host?",
        'answer': "This game is meant to be played with people whom you know. There is no matching engine and" +
            " you cannot join random games. Gather your friends to play!"
    },
    {
        'question': "How much does it cost to play?",
        'answer': "The ticket amount is set by the host. You still have to pay for gas, which depends on the network" +
            "condition."
    },
    {
        'question': "How much does it cost to play?",
        'answer': "The ticket amount is set by the host. You still have to pay for gas, which depends on the network" +
            "condition."
    }
]

const hostFAQs = [
    {
        'question': "How do you play?",
        'answer': "Use your brain!"
    },
    {
        'question': "How do you play?",
        'answer': "Use your brain!"
    }
]