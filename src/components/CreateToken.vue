<template>
  <div class="row">
    <b>CREATE TOKEN:</b>
    <br />

    <select v-model="makeToken.fromAdr">
      <option
        v-for="identity in identities"
        v-bind:key="identity.address"
        v-bind:value="identity.address"
      >{{identity.address}}</option>
    </select>
    <input v-model="makeToken.symbol" placeholder="symbol" />
    <br />
    <input v-model="makeToken.name" placeholder="name" />
    <input v-model="makeToken.description" placeholder="description" />
    <br />
    <input v-model="makeToken.granularity" placeholder="granularity" />
    <input v-model="makeToken.amount" placeholder="amount" />
    <br />

    <button
      v-on:click="createTokenSingle(makeToken.fromAdr, makeToken.symbol,makeToken.name,makeToken.description,makeToken.granularity,makeToken.amount)"
    >create single issuance</button>
    <button
      v-on:click="createTokenMulti(makeToken.fromAdr, makeToken.symbol,makeToken.name,makeToken.description,makeToken.granularity,makeToken.amount)"
    >create multi issuance</button>
  </div>
</template> 

<script>
import { RadixAccount, RadixTransactionBuilder } from "radixdlt";

import moment from "moment";
import { Decimal } from "decimal.js";

export default {
  name: "CreateToken",
  props: {
    identities: Array
  },
  data() {
    return {
      makeToken: {
        fromAdr: null,
        symbol: null,
        name: null,
        description: null,
        granularity: null,
        amount: null
      }
    };
  },
  methods: {
    createTokenSingle(fromAdr, symbol, name, description, granularity, amount) {
      const iconUrl = "http://a.b.com/icon.png";

      const fromIdentity = this._getIdentity(fromAdr);

      new RadixTransactionBuilder()
        .createTokenSingleIssuance(
          fromIdentity["account"],
          name,
          symbol,
          description,
          granularity,
          amount,
          iconUrl
        )
        .signAndSubmit(fromIdentity["identity"])
        .subscribe({
          next: status => {
            console.log(status);
          },
          complete: () => {
            console.log("Token defintion has been created");
          },
          error: error => {
            console.error("Error submitting transaction", error);
          }
        });
    },
    createTokenMulti(fromAdr, symbol, name, description, granularity, amount) {
      const iconUrl = "http://a.b.com/icon.png";

      const fromIdentity = this._getIdentity(fromAdr);

      new RadixTransactionBuilder()
        .createTokenMultiIssuance(
          fromIdentity["account"],
          name,
          symbol,
          description,
          granularity,
          amount,
          iconUrl
        )
        .signAndSubmit(fromIdentity["identity"])
        .subscribe({
          next: status => {
            console.log(status);
          },
          complete: () => {
            console.log("Token defintion has been created");
          },
          error: error => {
            console.error("Error submitting transaction", error);
          }
        });
    },
    _getIdentity(adr) {
      let ident = null;
      this.identities.map(identity => {
        if (identity.address == adr) {
          ident = identity;
        }
      });
      return ident;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
