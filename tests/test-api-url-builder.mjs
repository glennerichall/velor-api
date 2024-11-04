import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {UrlBuilder} from "../api/request/UrlBuilder.mjs"; // Update the path to your module

const {
    expect,
    test
} = setupTestContext()

test.describe('UrlBuilder', () => {

    test.describe('.constructor()', () => {

        test('should set correct initial state', () => {
            const builder = new UrlBuilder('http://localhost');
            expect(builder.getUrl()).to.equal('http://localhost');
            expect(builder.getParams()).to.be.an('object').that.is.empty;
            expect(builder.getQuery()).to.be.an('object').that.is.empty;
        });

        test('should throw an error if url is not provided', () => {
            expect(() => new UrlBuilder()).to.throw(Error);
        });
    });

    test.describe('.query()', () => {

        test('should set query parameters correctly when a single key-value pair is provided', () => {
            const builder = new UrlBuilder('http://localhost').query('foo', 'bar');
            expect(builder.getQuery()).to.deep.equal({ foo: 'bar' });
        });

        test('should set multiple query parameters when an object literal is provided', () => {
            const builder = new UrlBuilder('http://localhost').query({ foo: 'bar', baz: 'qux' });
            expect(builder.getQuery()).to.deep.equal({ foo: 'bar', baz: 'qux' });
        });

        test('should override existing query parameters', () => {
            const builder = new UrlBuilder('http://localhost').query('foo', 'bar').query('foo', 'qux');
            expect(builder.getQuery()).to.deep.equal({ foo: 'qux' });
        });
    });

    test.describe('.param()', () => {

        test('should set param values correctly when a single key-value pair is provided', () => {
            const builder = new UrlBuilder('http://localhost').param('foo', 'bar');
            expect(builder.getParams()).to.deep.equal({ foo: 'bar' });
        });

        test('should set multiple param values when an object literal is provided', () => {
            const builder = new UrlBuilder('http://localhost').param({ foo: 'bar', baz: 'qux' });
            expect(builder.getParams()).to.deep.equal({ foo: 'bar', baz: 'qux' });
        });

        test('should override existing param values', () => {
            const builder = new UrlBuilder('http://localhost').param('foo', 'bar').param('foo', 'qux');
            expect(builder.getParams()).to.deep.equal({ foo: 'qux' });
        });
    });

    test.describe('.params()', () => {

        test('should set multiple param values when an object literal is provided', () => {
            const builder = new UrlBuilder('http://localhost').params({ foo: 'bar', baz: 'qux' });
            expect(builder.getParams()).to.deep.equal({ foo: 'bar', baz: 'qux' });
        });

        test('should override existing param values', () => {
            const builder = new UrlBuilder('http://localhost').params({ foo: 'bar' }).params({ foo: 'qux' });
            expect(builder.getParams()).to.deep.equal({ foo: 'qux' });
        });

    });

    test.describe('.buildUrl()', () => {

        test('should correctly compose a url with query and path params', () => {
            const builder = new UrlBuilder('http://localhost/:foo')
                .param('foo', 'bar')
                .query('baz', 'qux');

            const url = builder.buildUrl();

            expect(url).to.equal('http://localhost/bar?baz=qux');
        });

        test('should correctly compose a url with multiple query and path params', () => {
            const builder = new UrlBuilder('http://localhost/:foo/one/:one')
                .param('foo', 'bar')
                .param('one', 'two')
                .query('baz', 'qux')
                .query('biz', 'boss');

            const url = builder.buildUrl();

            expect(url).to.equal('http://localhost/bar/one/two?baz=qux&biz=boss');
        });
    });
});