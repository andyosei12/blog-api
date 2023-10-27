// This class is used to filter, sort, paginate and search data
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(otherFilters = {}) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);
    this.query = this.query
      .find({
        ...queryObj,
        ...otherFilters,
      })
      .collation({
        locale: 'en',
        strength: 2,
      });
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-created_at');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search() {
    if (this.queryString.search) {
      const search = this.queryString.search;
      this.query = this.query.find({
        $text: {
          $search: search,
        },
      });
    }
    return this;
  }
}

module.exports = APIFeatures;
