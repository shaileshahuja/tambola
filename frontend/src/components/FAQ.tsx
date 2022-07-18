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
import { stringify } from "querystring";

export default function FAQ() {
    let sections = {
        'General': generalFAQs,
        'Prizes': prizesFAQs,
        'Play': playFAQs,
        'Host': hostFAQs
    }
    let sectionComponents = []
    for (let [title, section] of Object.entries(sections)) {
        let questions = []
        for (let entry of section) {
            questions.push(
                (
                    <Question question={entry.question} answer={entry.answer} />
                )
            )
        }
        sectionComponents.push(
            (
                <AccordionItem>
                    <AccordionButton>
                        <Text textAlign="left" fontSize="lg" pr="1">
                            {title}
                        </Text>
                        <AccordionIcon w={6} h={6} />
                    </AccordionButton>
                    <AccordionPanel pb={0}>
                        {questions}
                    </AccordionPanel>
                </AccordionItem>
            )
        )
    }
    return (
        <Accordion allowToggle height="15">
            {sectionComponents}
        </Accordion>
    )
}

function Question(props: { question: string, answer: string }) {
    let { question, answer } = props
    return (
        <VStack align="left" pb={5}>
            <Heading size={'sm'}>
                {question}
            </Heading>
            <Text color="gray.700">
                {answer}
            </Text>
        </VStack>
    )
}

const generalFAQs = [
    {
        'question': "What is tambola?",
        'answer': "Tambola is a variation of Bingo. Watch this video to learn the basics: https://www.youtube.com/watch?v=IbdOnLB4kaE&ab_channel=tambola"
    },
    {
        'question': "Which networks are supported?",
        'answer': "You can play on Polygon network. Both MATIC mainnet and mumbai testnet is supported."
    },
    {
        'question': "Where can I find the contract?",
        'answer': "Polygon Mainnet contract: 0xAcC4586c8DeBB07237F850896084cd1c65731814, Mumbai Testnet contract: 0x0a0A65F51c9b752330c6b2550fb6a12d39890eF5"
    },
    {
        'question': "Where can I find the source code?",
        'answer': "https://github.com/shaileshahuja/tambola"
    },
]

const prizesFAQs = [
    {
        'question': "What are the prizes?",
        'answer': "There are 12 prizes, which can be claimed once. Each ticket bought contributes to the pot. Three rows, corners, early five, center, breakfast, lunch, dinner and 3 full houses."
    },
    {
        'question': "How is the pot distributed?",
        'answer':
            "1st full house - 30%; 2nd full house - 15%; " +
            "Other prizes - 5% each; Game Host - 3%; Developer - 2%"
    },
    {
        'question': "What are top, middle and bottom rows?",
        'answer': "A ticket has three rows of 5 numbers each, you win a row when you are the first to strike off all numbers in that row."
    },
    {
        'question': "When do I win a corner?",
        'answer': "Corners are made up of four numbers. The left-most and the right-most numbers of the top and bottom rows."
    },
    {
        'question': "When do I win a center?",
        'answer': "Center consists of just one number. The middle number (3rd from left or right) of the middle row."
    },
    {
        'question': "What is early five?",
        'answer': "As the name suggests, the first person to strike off five numbers from their ticket can claim this prize."
    },
    {
        'question': "What is breakfast, lunch, and dinner?",
        'answer': "A ticket has nine columns. Breakfast maps to the left most three (1-29), lunch the middle three (30-59) and dinner the right most three (70-90) columns."
    },
    {
        'question': "What is a full house?",
        'answer': "A full house can be claimed when all 15 numbers from your ticket are striked off. There are three full houses available, with decreasing pot allocated to them."
    },
]

const playFAQs = [
    {
        'question': "How do I buy a ticket?",
        'answer': "You need a host wallet address to join that game and buy a ticket. " +
            "Anyone can host a game."
    },
    {
        'question': "When can I buy a ticket?",
        'answer': "You can buy a ticket only before any number has been generated. This helps ensure a fair game for everyone."
    },
    {
        'question': "How much does it cost to play?",
        'answer': "The ticket amount is set by the host. You still have to pay for gas, which depends on the network " +
            "condition. " + "Buying a ticket costs ~300,000 gas (~$0.025 as of 2021), while claiming a prize costs ~65,000."
    },
    {
        'question': "When do I get the my prize money?",
        'answer': "Prizes are distributed automatically, when the host ends the game. The host also gets their 3% fee and their deposit back at the same time. " +
            "This is an incentive for the host to end the game on time."
    },
    {
        'question': "What if I forget to claim my prize?",
        'answer': "You have 24 hours after all numbers are generated to claim any prizes left. " +
            "After 24 hours, the host will have the option to end the game and distribute the pot."
    },
]

const hostFAQs = [
    {
        'question': "How do I earn as a host?",
        'answer': "On successfully finishing a game, you get 3% of the pot. This minus any gas fees is your earned income."
    },
    {
        'question': "Does it cost to host a game?",
        'answer': "Hosting a game is free, although you have to pay for gas fees for transactions. You to perform upto 92 transactions, 1) host game, 2) generate 90 numbers, 3) end game" +
            "In total you have to pay for ~5,250,000 gas, which is ~$0.40 on MATIC network as of 2021."
    },
    {
        'question': "Why do I have to deposit MATIC on hosting a game?",
        'answer': "You have to transfer the ticket amount as collateral, which you will get back when you end the game. " +
            "This is an incentive to end the game on time and distribute the pot."
    },
    {
        'question': "When does a game start?",
        'answer': "The game starts as soon as you generate the first number. Until then, players can buy tickets, but not after that."
    },
    {
        'question': "When does a game finish?",
        'answer': "The game finishes immediately when all 12 prizes are claimed, or 24 hours after all 90 numbers have been generated."
    }
]
