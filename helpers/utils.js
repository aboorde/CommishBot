/**
 * Produce an immediate response with some text.
 */
export const produceImmediateResponse = (response) => {
  return produceResponseObjectForText(response);
};

/**
 * Produce a simple text response object.
 */
export const produceResponseObjectForText = (text) => {
  return {
    text: text,
  };
};

export const formatNumber = (floatNumber) => {
  return Math.round(floatNumber * 100) / 100;
};
