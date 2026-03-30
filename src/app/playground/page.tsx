"use client";
import * as React from "react";

import { useAppDispatch, useAppSelector } from "~store";
import { decrement, increment, incrementByAmount, selectCount } from "~store/counter/slice";

const PlaygroundPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const [incrementAmount, setIncrementAmount] = React.useState<number>(0);
  return (
    <>
      <h2>
        The current number is
        {count}
      </h2>
      <div>
        <input
          value={incrementAmount}
          onChange={(e) => {
            setIncrementAmount(Number(e.target.value));
          }}
          type="number"
        />
        <button onClick={() => dispatch(incrementByAmount(Number(incrementAmount)))}>Increment by amount</button>
      </div>
      <div>
        <button onClick={() => dispatch(decrement())}>Decrement by 1</button>
        <button onClick={() => dispatch(increment())}>Increment by 1</button>
      </div>
    </>
  );
};

export default PlaygroundPage;
