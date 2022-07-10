const pagination = (data) => {
  return (res, req, next) => {
    console.log(page);
    const total = data.length;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const resultPage = {
      current: page,
      total: total,
      from: startIndex + 1,
      to: endIndex > total ? total : endIndex,
    };

    if (endIndex < total) {
      resultPage.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      resultPage.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    return data.slice(startIndex, endIndex);
  };
};

module.exports = pagination;
