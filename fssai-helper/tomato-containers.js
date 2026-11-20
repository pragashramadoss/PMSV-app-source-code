/* Container measurements shared by FSSAI 2.3.3A and 2.3.8. */
(function (root) {
  'use strict';
  const measures=typeof module==='object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const {decimal,fillPercentText}=measures;
  const packLabels = {can:'Metal can',glass:'Glass container',other:'Other non-glass container (including flexible)'};
  const capacityLabels = {stated:'Full capacity, distilled water at 27 °C',other:'Another temperature, adjusted or unconfirmed capacity'};
  const vacuumLabels = {negative:'Negative gauge pressure confirmed',nonnegative:'Zero or positive gauge pressure confirmed',unknown:'Magnitude only or sign convention unclear'};

  function vacuumOutcome(sign) {
    if (sign==='negative') return 'Meets the negative-vacuum requirement';
    if (sign==='nonnegative') return 'Does not meet the negative-vacuum requirement';
    if (sign==='unknown') return 'Confirm the gauge sign convention';
    return 'Awaiting a vacuum observation';
  }

  function millilitres(n,scale) {
    const digits=(n%scale).toString().padStart(scale.toString().length-1,'0').replace(/0+$/,'');
    return (n/scale).toString() + (digits ? '.'+digits : '');
  }

  function fillAssessment(rule,pack,basis,productVolume,fullCapacity,contents='juice') {
    if (!Object.hasOwn(packLabels,pack)) return {outcome:'Confirm the container material'};
    if (basis!=='stated') return {outcome:'Confirm the full distilled-water capacity at '+rule.waterTemperatureC+' °C'};
    const capacity=String(fullCapacity??'').trim(), product=String(productVolume??'').trim();
    if (!capacity) return {outcome:'Enter the full measured water capacity'};
    const water=decimal(capacity);
    if (!water || water.n===0n) return {outcome:'Enter a positive full water capacity in mL'};
    const deduction=pack==='glass' ? BigInt(rule.glassDeductionMl)*water.scale : 0n;
    const reference=water.n-deduction;
    if (reference<=0n) return {outcome:'Glass water capacity must exceed the '+rule.glassDeductionMl+' mL deduction'};
    const amounts={referenceMl:millilitres(reference,water.scale),
      minimumMl:millilitres(reference*BigInt(rule.minimumPercent),100n*water.scale)};
    if (!product) return {...amounts,outcome:'Enter the volume occupied by '+contents};
    const volume=decimal(product);
    if (!volume) return {...amounts,outcome:'Enter a non-negative '+contents+' volume in mL'};
    const numerator=volume.n*water.scale;
    if (numerator>water.n*volume.scale) return {...amounts,outcome:contents.charAt(0).toUpperCase()+contents.slice(1)+' volume exceeds the full measured capacity. Check both volumes.'};
    return {...amounts,outcome:fillPercentText(numerator,reference*volume.scale,rule.minimumPercent)};
  }

  function fillLines(result,contents='juice') {
    const lines=result.referenceMl===undefined ? [] :
      ['Reference capacity · '+result.referenceMl+' mL','Minimum '+contents+' volume · '+result.minimumMl+' mL'];
    return [...lines,result.outcome];
  }

  const api=Object.freeze({packLabels,capacityLabels,vacuumLabels,vacuumOutcome,fillAssessment,fillLines});
  if (typeof module==='object' && module.exports) module.exports=api;
  root.PMSVTomatoContainers=api;
})(typeof globalThis==='object' ? globalThis : this);
