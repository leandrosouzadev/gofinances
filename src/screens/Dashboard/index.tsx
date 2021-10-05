import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import {
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName, 
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer
}  from './styles';

export interface DatalistProps extends TransactionCardProps {
    id: string;
}

interface HighLightProps {
    amount: string;
}

interface HighLightData {
    entries: HighLightProps;
    expensives:  HighLightProps;
    total: HighLightProps;
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DatalistProps[]>([]);
    const [highLightData, setHighLightData]  = useState<HighLightData>({} as HighLightData);

    const theme = useTheme();

    async function loadTransactions() {
        const dataKey = '@gofinances:transactions';        
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];
        
        let entriesTotal = 0;
        let expensivesTotal = 0;

        const transactionsFormatted: DatalistProps[] = transactions
        .map((item: DatalistProps) => {
            if(item.type === 'positive') {
                entriesTotal += Number(item.amount);
            } else {
                expensivesTotal += Number(item.amount);
            }

            const amount = Number(item.amount)
            .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            
            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date
            }
        });        
        
        setTransactions(transactionsFormatted);

        const total = entriesTotal - expensivesTotal;

        setHighLightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            },
            expensives: {
                amount: expensivesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            }
        });

        setIsLoading(false);
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    useFocusEffect(useCallback(() => {
        loadTransactions();
    },[]));

    return(
        <Container>            
            {
                isLoading ? 
                <LoadContainer>
                    <ActivityIndicator 
                        color={theme.colors.primary}
                        size="large"
                    />
                </LoadContainer> :
                <>
                    <Header>
                        <UserWrapper>
                            <UserInfo>
                                <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/53835002?v=4'}}/>
                                <User>
                                    <UserGreeting>Olá,</UserGreeting>
                                    <UserName>Leandro</UserName>
                                </User>
                            </UserInfo>

                            <LogoutButton onPress={() => {}}>
                                <Icon name="power"/>
                            </LogoutButton>
                        </UserWrapper>
                    </Header>

                    <HighlightCards>
                        <HighlightCard
                            type="up"
                            title="Entradas"                    
                            amount={highLightData.entries.amount}
                            lastTransaction="Última transação em 13 de abril"
                        />

                        <HighlightCard
                            type="down"
                            title="Saídas"                    
                            amount={highLightData.expensives.amount}
                            lastTransaction="Última transação em 03 de abril"
                        />

                        <HighlightCard
                            type="total"
                            title="Total"                    
                            amount={highLightData.total.amount}
                            lastTransaction="01 à 16 de abril"
                        />            
                    </HighlightCards>
                    
                    <Transactions>
                        <Title>Listagem</Title>

                        <TransactionList 
                            data={transactions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <TransactionCard data={item}/>}
                        />
                        
                    </Transactions>
                </>
            }
        </Container>
    );
}