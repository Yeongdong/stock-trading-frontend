'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface Account {
  portfolio_value: string;
  cash: string;
}

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  market_value: string;
  unrealized_pl: string;
}

interface BarData {
  t: string;
  c: number;
}

const TradingDashboard: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [historicalData, setHistoricalData] = useState<BarData[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  // 계정 정보 조회
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/alpaca/account`);
        const data = await response.json();
        setAccount(data);
      } catch (error) {
        console.error('계정 정보 조회 실패:', error);
      }
    };
    fetchAccount();
  }, []);

  // 포지션 정보 조회
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/alpaca/positions`);
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error('포지션 조회 실패:', error);
      }
    };
    fetchPositions();
  }, []);

  // 주식 차트 데이터 조회
  const fetchHistoricalData = async (symbol: string) => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      const response = await fetch(
        `/api/v1/alpaca/market-data/${symbol}/bars?start=${start}&end=${end}&timeframe=1Day`
      );
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('히스토리컬 데이터 조회 실패:', error);
    }
  };

  // 주문 제출
  const handleSubmitOrder = async () => {
    try {
      const orderRequest = {
        symbol: stockSymbol,
        qty: parseInt(quantity),
        side: 'buy',
        type: orderType,
        time_in_force: 'day'
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/alpaca/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });
  
      if (response.ok) {
        alert('주문이 성공적으로 제출되었습니다.');
      }
    } catch (error) {
      console.error('주문 제출 실패:', error);
      alert('주문 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 계정 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              계정 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            {account && (
              <div className="space-y-2">
                <p>계정 가치: ${Number(account.portfolio_value).toLocaleString()}</p>
                <p>현금 잔액: ${Number(account.cash).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 주문 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              주문 입력
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="주식 심볼"
                value={stockSymbol}
                onChange={(e) => {
                  setStockSymbol(e.target.value.toUpperCase());
                  fetchHistoricalData(e.target.value.toUpperCase());
                }}
              />
              <Input
                type="number"
                placeholder="수량"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="market">시장가</option>
                <option value="limit">지정가</option>
              </select>
              <Button 
                className="w-full"
                onClick={handleSubmitOrder}
                disabled={!stockSymbol || !quantity}
              >
                주문 제출
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 카드 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            가격 차트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="c" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 보유 포지션 카드 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            보유 포지션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">심볼</th>
                  <th className="text-right p-2">수량</th>
                  <th className="text-right p-2">평균 매수가</th>
                  <th className="text-right p-2">현재 가치</th>
                  <th className="text-right p-2">손익</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.symbol} className="border-b">
                    <td className="p-2">{position.symbol}</td>
                    <td className="text-right p-2">{position.qty}</td>
                    <td className="text-right p-2">${Number(position.avg_entry_price).toFixed(2)}</td>
                    <td className="text-right p-2">${Number(position.market_value).toFixed(2)}</td>
                    <td className="text-right p-2">
                      <span className={Number(position.unrealized_pl) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${Number(position.unrealized_pl).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingDashboard;