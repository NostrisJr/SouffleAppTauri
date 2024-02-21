import React from 'react';

type knobProp = {
    potId: number;
    interfaceId: number;
    colors: Array<Array<string>>;
    transform: string;
    handlePotClick: ({ interfaceId, potId}: handlePotClickProp) => void;
}

type handlePotClickProp = {
    interfaceId: number;
    potId: number;
};

function InterfaceKnob ({ potId, interfaceId, colors, transform, handlePotClick }: knobProp) {

    return (
        <circle
            cx={5776.14}
            cy={6435.59}
            r={19.662}
            style={{
              fill: colors[interfaceId][potId],
            }}
            transform={transform}
            onClick={() => handlePotClick({ interfaceId, potId})}
        />
    );
}

export { InterfaceKnob };
