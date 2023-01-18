import React, {FunctionComponent, useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

// styles
import {styles} from '../styles';

// components
import {OrdersCard, SkeletonComponent} from '../components';

//
import {SearchBar, Text} from 'react-native-elements';

// api
import {useActions} from '../hooks/useAction';
import {useTypedSelector} from '../hooks/useTypeSelector';
import {ApiService} from '../services';
import {AppState} from '../models';

interface Props {}

const OrdersScreen: FunctionComponent<Props> = props => {
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const {root, centerPosition, text_Caption1} = styles;

  const {orders, currentAccount} = useTypedSelector(
    (state: AppState) => state.user,
  );
  const {getOrders, errorResponse} = useActions();

  const currentResponse = () => {
    return currentAccount.role === 'user'
      ? ApiService.INSTANCE.getOrdersUser(currentAccount.data?.id)
      : ApiService.INSTANCE.getOrdersProvider(currentAccount.data?.id);
  };

  useEffect(() => {
    setLoading(true);

    currentResponse()
      .then(resp => getOrders(resp.results))
      .catch(error => {
        console.log('getOrders error', error);
        errorResponse();
      })
      .finally(() => setLoading(false));
  }, [currentAccount.data?.id]);

  if (loading) {
    return <SkeletonComponent type="OrdersScreen" />;
  }

  return orders?.length !== 0 ? (
    <FlatList
      data={orders}
      renderItem={({item}) => (
        <OrdersCard
          order={item}
          role={currentAccount.role}
          onPress={() => {
            props.navigation.navigate('OrderDetailsScreen', {
              orderId: item.id,
            });
          }}
          style={{marginBottom: 12}}
        />
      )}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      style={root}
    />
  ) : (
    <View style={[root, centerPosition]}>
      <Text style={text_Caption1}>Нет заказов</Text>
    </View>
  );
};

export {OrdersScreen};
