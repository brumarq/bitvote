export class EggBox {
    key: string;
    record: EggBoxRecord;
}

export class EggBoxRecord {
    currentState: string;
    eggBoxId: string;
    holderId: string;
    originId: string;
    packingTimestamp: string;
    quantity: string;
}