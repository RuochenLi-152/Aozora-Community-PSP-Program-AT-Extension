import React, { useState } from 'react';
import { Box, Button, Text } from '@airtable/blocks/ui';

export function Home({ onNavigate }) {
    return (
        <Box
            minHeight="100vh"
            position="relative"
            style={{
                backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTur58fTBJ0KVV3IZl76LUuXk9gEWQmIVkRag&s')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                overflow: 'hidden',
            }}
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                backgroundColor="rgba(255, 255, 255, 0.7)"
                zIndex={0}
            />

            <Box
                position="relative"
                zIndex={1}
                height="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                padding={4}
            >
                <Text fontSize={5} marginBottom={'60px'} 
                style={{
                    lineHeight: 1.6,
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold'
                    }}>
                    Welcome to Aozora Preschool Program Automation Helper
                </Text>

                <Button
                    variant="primary"
                    size="large"
                    marginBottom={3}
                    onClick={() => onNavigate('auto-update')}
                >
                    Update Schedule
                </Button>

                <Button
                    variant="default"
                    size="large"
                    onClick={() => onNavigate('add-student')}
                >
                    Add Students
                </Button>


                <Box
                    marginTop={3}
                    fontSize={3}
                    style={{
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                    onClick={() => onNavigate('instructions')}
                >
                    How to use?
                </Box>
            </Box>
        </Box>
    );
}
