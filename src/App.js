import React, { Component } from 'react';
// import {fx} from './money'
import './App.css';

class App extends Component {
    state = {
        result: null,
        fromCurrency: "USD",
        toCurrency: "GBP",
        amount: '',
        currencies: [],
        currentRates: [],
        error: null
    };

    // Initializes the currencies with values from the api
    componentDidMount() {
        this.getDataFromApi()
    }
    
    getDataFromApi=()=>{
      fetch('https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json')
        .then(response => response.json())
        .then(data => {
              const currencies = []
              for (const key in data) {
                    currencies.push(data[key])
              }
          this.setState({ currencies: currencies })})
        .catch(err => console.log("Oops, couldn't fetch currencies", err.message)) 
        
      fetch('http://data.fixer.io/api/latest?access_key=d0f3b7da0757140a192df5c5ee3fd3cf')
        .then(response => response.json())
        .then(data => {
              const currentRates = [data.rates]
          this.setState({ currentRates: currentRates })})
        .catch(err => console.log("Oops, couldn't fetch current rates", err.message))    
    }

    convertCurrencyHandler = () => {
      if(!this.state.currentRates[0][this.state.toCurrency]){
        this.setState({ error: "Currency rate not currently available!" })
    } else if (this.state.fromCurrency !== this.state.toCurrency) {
                    this.setState({ error: null })
                    const result = this.state.amount * this.state.currentRates[0][this.state.toCurrency]
                    this.setState({ result: result.toFixed(2) }) 
        } else {
          this.setState({ error: "You cant convert the same currency!" })
        }
    };

    displayFromCurrencySymbol = () => {
      return this.state.currencies.map((currency, i) =>{
          if(currency.code == this.state.fromCurrency){
            return <span key={i} className="currencySymbol">{currency.symbol}</span>
          }
      }
     )
    }

    displayToCurrencySymbol = () => {
      return this.state.currencies.map((currency, i) =>{
          if(currency.code == this.state.toCurrency){           
            return <span key={i} className="currencySymbol">{currency.symbol}</span>
          }
       }
     )
    }

    displayResult = () => {
      if(!this.state.result){
        return <div></div>
      } else {
        return <h2>{this.displayFromCurrencySymbol()}{this.state.amount} = {this.displayToCurrencySymbol()}{this.state.result}</h2>
      }
    }

    displayError = () => {
      if(!this.state.error){
        return <div></div>
      } else {
        return <h3>{this.state.error}</h3>
      }
    }

    // Updates the states based on the dropdown that was changed
    selectHandler = (e) => {
        if (e.target.name === "from") {
          this.setState({ result: null})
            this.setState({ fromCurrency: e.target.value })
        }
        if (e.target.name === "to") {
            this.setState({ result: null})
            this.setState({ toCurrency: e.target.value })
        }
    }
    
    
    removeDecimalFromNumber = (value = '') => {return value.replace(/(-(?!\d))|[^0-9|-]/g, '') || ''}

    addLeadingZeros = (number) => {
      const desiredLength = 3
      const actualLength = number.length

      if (actualLength >= desiredLength) {
        return number
      }

      const amountToAdd = desiredLength - actualLength
      const leadingZeros = '0'.repeat(amountToAdd)

      return leadingZeros + number
    }

    removeLeadingZeros = (number) => number.replace(/^0+([0-9]+)/, '$1')

    addDecimalToNumber = (number) => {
      const centsStartingPosition = number.length - 2
      const dollars = this.removeLeadingZeros(
        number.substring(0, centsStartingPosition)
      )
      const cents = number.substring(centsStartingPosition)
      return `${dollars}.${cents}`
    }

    currencyInputHandler = (e) => {
      const number = this.removeDecimalFromNumber(e.target.value)
      const numberWithPadding = this.addLeadingZeros(number)
      this.setState({ amount: this.addDecimalToNumber(numberWithPadding)})
    }

  render() {
    return (
      <div className="container">
      <h1>Currency Converter</h1>
      <div className="convertForm">
          {this.displayFromCurrencySymbol()}
          <input
            className="inputElement"
            placeholder="0.00" 
            type="number"
            step="0.01"
            value={this.state.amount}
            onChange={(e)=>{this.currencyInputHandler(e)}}
          />
          <select
              name="from"
              className="inputElement"
              onChange={(e) => this.selectHandler(e)}
              value={this.state.fromCurrency}
          >
              {this.state.currencies.map(currency => <option key={currency.code}>{currency.code}</option>)}
          </select>
          <div className="inputElement">to</div>
          <select
              name="to"
              className="inputElement"
              onChange={(e) => this.selectHandler(e)}
              value={this.state.toCurrency}
          >
              {this.state.currencies.map(currency => <option key={currency.code}>{currency.code}</option>)}
          </select>
          <button className="inputElement" onClick={this.convertCurrencyHandler}>Convert</button>
      </div>
        {this.displayResult()}
        {this.displayError()}
  </div>
    );
  }
}

export default App;
