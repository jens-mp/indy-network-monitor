# indy-network-monitor
Reduced version of a network monitor backend for indy networks

# Notes

Create backend/.env file with the following content

```
export SEED=<YOUR_DID_SEED>
```

and add a pool_transactions_genesis file in `backend/src/server.ts` line 6