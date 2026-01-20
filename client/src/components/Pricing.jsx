import React from 'react';
import './Pricing.css'
import IconTick from '../assets/IconTick.svg'

const pricingData = [
  {
    serviceName: "Free",
    price: "$0",
    priceTag: "forever",
    tag: "Try it out with limited access",
    includes: [ 
      "Download up to 200 pins total",
      "Basic image quality",
      "Standard download speed",
      "Auto-folder organization"
    ],
    button:"Start Now",
    inUse:true
  },
  {
    serviceName: "Single-Use",
    price: "$4.99",
    priceTag: "one-time",
    tag: "Perfect for one board downloads",
    includes: [
      "Download one full board once",
      "High image quality",
      "Fast download speed",
      "Auto-folder organization",
    ],
    button:"Buy Now",
    inUse:false
  },
  {
    serviceName: "Monthly",
    price: "$9.99",
    priceTag: "per month",
    tag: "Unlimited access for a month",
    includes: [
      "Unlimited board downloads",
      "Original image quality",
      "High-speed downloads",
    //   "Bulk processing",
      "Auto-folder organization",
    ],
    button:"Buy Now",
    inUse:false
  }
];


function PricingCard({ plan }) {
  return (
    <div className="card">
      <div className="service-name">{plan.serviceName}</div>
      <div className="price">
        {plan.price}<span>/{plan.priceTag}</span>
      </div>
      <div className="tag">{plan.tag}</div>
      <div className="includes">
        {plan.includes.map((item, idx) => (
          <div key={idx}>
            <img src={IconTick} alt="Tick" />
            <p>{item}</p>
          </div>
        ))}
      </div>
      <button className={`buy-button no-select ${plan.serviceName} ${plan.inUse ? 'buy-button' : ''}`}>{plan.button}</button>
    </div>
  );
}

const Pricing = () => {
  return (
    <div className="Pricing Constants no-select">
      <div className='Pricing-Main'>
        <h2>Simple, Transparent <span>Pricing</span></h2>
        <h3>Choose the plan that fits your needs. No hidden fees, no surprises.Secure payment processing and no setup fees.</h3>
      </div>

      <div className="pricing-container">
        {pricingData.map((plan, index) => (
          <PricingCard key={index} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default Pricing;
