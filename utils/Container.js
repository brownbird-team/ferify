// @ts-check

/**
 * Class type that can be supplied as provider
 * 
 * @template T
 * @typedef {new (...args: any[]) => T & { name: string }} ClassWithNamedConstructor
 */

/**
 * Object that represents provider in container config
 * 
 * @typedef ContainerProviderConfig
 * 
 * @property {string} name
 * @property {'singleton' | 'scoped' | 'transident'} scope
 * @property {ClassWithNamedConstructor<any>} useClass
 */

/**
 * Container provider configuration stored internally
 * 
 * @typedef ContainerProvider
 * 
 * @property {'singleton' | 'scoped' | 'transident'} scope
 * @property {ClassWithNamedConstructor<any>} useClass
 * @property {string[]} args
 */

/**
 * Context class that represents scope for scoped
 * providers
 */
class ContainerContext extends Map {
    constructor() {
        super();
    }
}

/**
 * DI Container class used to resolve dependencies
 */
class Container {

    /** @type {Map<string, ContainerProvider>} */
    providers;
    /** @type {Map<string, string>} */
    classToProvider;
    /** @type {ContainerContext} */
    singletonCtx;

    /**
     * @param {ContainerProviderConfig[]} providers
     */
    constructor(providers) {
        this.providers = new Map();
        this.classToProvider = new Map();
        this.singletonCtx = this.getContext();

        providers.forEach((prov) => {
            this.classToProvider.set(prov.useClass.name, prov.name);
            this.providers.set(prov.name, {
                scope: prov.scope,
                useClass: prov.useClass,
                args: this.extractDependencies(prov.useClass),
            })
        });
    }

    /**
     * Find names of all constructor arguments
     * 
     * @private
     * @param {ClassWithNamedConstructor<any>} providerClass
     * @returns {string[]}
     */
    extractDependencies(providerClass) {
        const params = providerClass.toString()
            ?.replace(/ /g, '')
            ?.match(/(?<=constructor\()(.+)(?=\s*\))/ig)
            ?.[0]
            ?.split(',')
            ?.map(p => p.trim())
            ?.filter(Boolean);

        return params || [];
    }

    /**
     * Resolve given class
     * 
     * @template T
     * @param {new (...args: any[]) => T} requestedClass
     * @param {ContainerContext | null} [context = null]
     * @returns {T}
     */
    resolve(requestedClass, context = null) {
        const name = this.classToProvider.get(requestedClass.name);

        if (!name)
            throw new Error(`DI Container: Failed to resolve "${requestedClass.name}", class not found`);

        return this.resolveProvider(name, context);
    }

    /**
     * Resolve given provider by name
     * 
     * @param {string} name
     * @param {ContainerContext | null} [context = null]
     * @returns {any}
     */
    resolveProvider(name, context = null) {
        const provider = this.providers.get(name);

        if (!provider)
            throw new Error(`DI Container: Failed to resolve "${name}", provider not found`);

        if (provider.scope === 'singleton') {
            if (this.singletonCtx.has(name))
                return this.singletonCtx.get(name);

            const args = provider.args.map(a => this.resolveProvider(a, null))
            const instance = new provider.useClass(...args);

            this.singletonCtx.set(name, instance);
            return instance;
        }

        if (provider.scope === 'transident') {
            const args = provider.args.map(a => this.resolveProvider(a, context))
            return new provider.useClass(...args);
        }

        if (provider.scope === 'scoped') {
            if (!context)
                throw new Error(`DI Container: Cannot resolve scoped provider without context (resolving: ${name})`);

            if (context.has(name))
                return context.get(name)

            const args = provider.args.map(a => this.resolveProvider(a, context))
            const instance = new provider.useClass(...args);

            context.set(name, instance);
            return instance;
        }

        throw new Error(`DI Container: Provider "${name}" scope invalid`);
    }

    /**
     * Create new container context
     * 
     * @returns {ContainerContext}
     */
    getContext() {
        return new ContainerContext();
    }
}

exports.Container = Container;
exports.ContainerContext = ContainerContext;