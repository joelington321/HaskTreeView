/**
 * ARQUIVO FICTÍCIO PARA TESTE
 * Este é um arquivo de exemplo usado apenas para testar o analisador Haskell.
 * Não representa um projeto real.
 */

import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { styles } from './styles';

const Component2 = () => {
    const [count, setCount] = useState(0);

    const increment = () => setCount(prevCount => prevCount + 1);
    const decrement = () => setCount(prevCount => prevCount - 1);

    return (
        <View style={styles.container}>
            <Text style={styles.counterText}>Contador: {count}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Incrementar" onPress={increment} />
                <Button title="Decrementar" onPress={decrement} color="#ff6347" />
            </View>
        </View>
    );
};

export default Component2;