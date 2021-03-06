(function() {
  Ember.ENV.TESTING = true;

  describe('EmberCouchDBKit.DocumentAdapter', function() {
    beforeEach(function() {
      return this.subject = new TestEnv();
    });
    describe('model creation', function() {
      it('record with specific id', function() {
        var person;
        person = this.subject.create.call(this, Fixture.Person, {
          id: 'john@example.com'
        });
        return runs(function() {
          return expect(person.id).toBe('john@example.com');
        });
      });
      it('record with generated id', function() {
        var person;
        person = this.subject.create.call(this, Fixture.Person, {});
        return runs(function() {
          return expect(person.id).not.toBeNull();
        });
      });
      it('simple {a:"a", b:"b"} model', function() {
        var person;
        person = this.subject.create.call(this, Fixture.Person, {
          a: 'a',
          b: 'b'
        });
        return runs(function() {
          expect(person.get('a')).toBe('a');
          return expect(person.get('b')).toBe('b');
        });
      });
      it('always available as a raw json object', function() {
        var person;
        person = this.subject.create.call(this, Fixture.Person, {
          name: 'john'
        });
        return runs(function() {
          return expect(person.get('_data.raw').name).toBe('john');
        });
      });
      it('belongsTo relation', function() {
        var article, person;
        person = this.subject.create.call(this, Fixture.Person, {
          name: 'john'
        });
        article = this.subject.create.call(this, Fixture.Article, {
          person: person
        });
        return runs(function() {
          return expect(article.get('person.name')).toBe('john');
        });
      });
      it('belongsTo field avilable as a raw js object', function() {
        var message, person;
        Fixture.Message = DS.Model.extend({
          person: DS.belongsTo(Fixture.Person),
          person_key: "name"
        });
        person = this.subject.create.call(this, Fixture.Person, {
          name: 'john'
        });
        message = this.subject.create.call(this, Fixture.Message, {
          person: person
        });
        return runs(function() {
          return expect(message.get('_data.raw').person).toBe('john');
        });
      });
      it('with unsaved entity in hasMany', function() {
        var article, comment;
        comment = this.subject.create.call(this, Fixture.Comment, {
          text: 'text'
        });
        article = this.subject.create.call(this, Fixture.Article, {
          label: 'label'
        });
        runs(function() {
          article.get('comments').pushObject(comment);
          return article.save();
        });
        waitsFor(function() {
          return article.get('_data.raw').comments !== void 0;
        }, "article saving", 3000);
        return runs(function() {
          return expect(article.get('comments').toArray()[0]).toBe(comment);
        });
      });
      return it('with hasMany pushObject', function() {
        var article, comment;
        article = this.subject.create.call(this, Fixture.Article, {
          label: 'label'
        });
        comment = Fixture.Comment.createRecord({
          text: 'text'
        });
        runs(function() {
          article.get('comments').pushObject(comment);
          return comment.save();
        });
        waitsFor(function() {
          return comment.id !== null;
        }, "commment saving", 3000);
        runs(function() {
          return article.save();
        });
        waitsFor(function() {
          return article.get('_data.raw').comments !== void 0;
        }, "saving article", 3000);
        return runs(function() {
          return expect(article.get('comments').objectAt(0)).toBe(comment);
        });
      });
    });
    describe('model updating', function() {
      it('in general', function() {
        var person, prevRev;
        person = this.subject.create.call(this, Fixture.Person, {
          name: "John"
        });
        prevRev = void 0;
        runs(function() {
          prevRev = person.get("_data._rev");
          person.set('name', 'Bobby');
          return person.save();
        });
        waitsFor(function() {
          return prevRev !== person.get("_data._rev");
        }, "saving person", 3000);
        return runs(function() {
          return expect(prevRev).not.toEqual(person.get("_data._rev"));
        });
      });
      it('with belongsTo', function() {
        var article, name, newName, person1, person2, prevRev;
        name = 'Vpupkin';
        newName = 'Bobby';
        person1 = this.subject.create.call(this, Fixture.Person, {
          name: name
        });
        article = void 0;
        prevRev = void 0;
        person2 = void 0;
        article = this.subject.create.call(this, Fixture.Article, {
          label: 'Label',
          person: person1
        });
        runs(function() {
          prevRev = article.get("_data._rev");
          return person2 = this.subject.create.call(this, Fixture.Person, {
            name: newName
          });
        });
        runs(function() {
          article.set('person', person2);
          return article.save();
        });
        waitsFor(function() {
          return prevRev !== article.get("_data._rev");
        }, "saving article", 3000);
        return runs(function() {
          expect(prevRev).not.toEqual(article.get("_data._rev"));
          return expect(article.get('person.name')).toEqual(newName);
        });
      });
      return it('with hasMany', function() {
        var article, comment, comment1;
        article = this.subject.create.call(this, Fixture.Article, {
          label: 'label'
        });
        comment = void 0;
        comment1 = void 0;
        runs(function() {
          comment = this.subject.create.call(this, Fixture.Comment, {
            text: 'text'
          });
          return comment1 = this.subject.create.call(this, Fixture.Comment, {
            text: 'text 1'
          });
        });
        runs(function() {
          article.get('comments').pushObjects([comment, comment1]);
          return article.save();
        });
        waitsFor(function() {
          return article.get('_data.raw').comments !== void 0 && article.get('_data.raw').comments.length === 2;
        }, "article saving with comments", 3000);
        return runs(function() {
          return expect(article.get('comments').toArray().length).toEqual(2);
        });
      });
    });
    return describe("deletion", function() {
      return it("in general", function() {
        var person;
        person = this.subject.create.call(this, Fixture.Person, {
          name: 'Vpupkin'
        });
        return runs(function() {
          person.deleteRecord();
          person.save();
          return expect(person.get('isDeleted')).toBe(true);
        });
      });
    });
  });

}).call(this);
