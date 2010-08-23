JSBuilder = {
    version: '3.0.0',

    argMappings: {
        p: 'projectFile',
        d: 'homeDir',
        v: 'verbose',
        s: 'debugSuffix',
        c: 'compressor',
        b: 'build',
        h: 'help'
    },

    run: function() {
        try {
            var args = this.parseArgs();

            this.log('');

            if (args.help) {
                this.printUsage();
                return;
            }

            if (!args.homeDir) {
                this.error('The --homeDir or -d argument is required and was not included in the commandline arguments.');
            }

            if (!args.projectFile) {
                this.error('The --projectFile or -p argument is required and was not included in the commandline arguments.');
            }

            if (!args.homeDir || !args.projectFile) {
                this.printUsage();
                return;
            }

            if (!args.debugSuffix) {
                args.debugSuffix = '-debug';
            }

            this.outputFiles = {};

            this.openProjectFile();

            this.build = args.build || this.project.config.build;
            this.loadTargets();
            this.makeDeployDir();
            this.createPackages();
            this.createTargets();
            this.copyResources();
            //this.writeHeadersToTargets();

            if (args.compressor !== true) {
                this.compressOutputFiles();
            }

            this.log('Done building!\n');
        }
        catch(e) {
            this.log(e.toString());
        }
    },

    createPackages: function() {
        var project = this.project,
            pkgs = project.targets,
            args = this.args,
            ln = pkgs.length,
            basePath = project.deployDir + Fs.sep,
            i,
            pkg,
            fileName,
            x,
            xln,
            include,
            includes,
            includePath,
            parsed,
            file,
            dir,
            path;

        if (project.config.buildInSubDir) {
            if (!this.build) {
                this.error('The buildInSubDir option is turned on in jsb file, but no build has been specified.');
            }
            basePath += this.build + Fs.sep;
        }

        try {
            for (i = 0; i < ln; i++) {
                pkg = pkgs[i];
                if (pkg.packages) {
                    continue;
                }

                if (args.build) {
                    if (pkg.exclude) {
                        pkg.exclude = (typeof pkg.exclude == 'string') ? [pkg.exclude] : pkg.exclude;
                        if (pkg.exclude.indexOf(args.build) != -1) {
                            continue;
                        }
                    }

                    if (pkg.builds) {
                        pkg.builds = (typeof pkg.builds == 'string') ? [pkg.builds] : pkg.builds;
                        if (pkg.builds.indexOf(args.build) == -1) {
                            continue;
                        }
                    }
                }

                fileName = pkg.target || pkg.file;
                if (!fileName) {
                    continue;
                }
                
                fileName = fileName.replace(/\//g, Fs.sep);
                
                if (fileName.indexOf('.js') != -1) {
                    fileName = fileName.substring(0, fileName.length - 3);
                    if (pkg.debug) {
                        fileName += args.debugSuffix;
                    }
                    if (!project.config.buildInSubDir && this.build) {
                        fileName += '-' + this.build;
                    }
                    fileName += '.js';
                }

                if (args.verbose) {
                    this.log('Building the "' + pkg.name + '" package as "' + fileName + '"');
                }
                
                // create file
                if (fileName.indexOf(Fs.sep) != -1) {
                    dir = fileName.substr(0, fileName.lastIndexOf(Fs.sep));
                    fileName = fileName.replace(dir, '').substr(1);
                    path = Fs.mkdir(basePath + dir) + Fs.sep + fileName;
                }
                else {
                    path = basePath + fileName;
                }

                this.outputFiles[pkg.id || path] = {
                    id: pkg.id || path,
                    path: path,
                    compress: pkg.debug || pkg.isDebug
                };
                                
                file = new Stream(path, 'w');

                // include files for this package
                includes = pkg.files || pkg.fileIncludes;
                if (args.verbose) {
                    this.log('- ' + includes.length + ' file(s) included in this package.');
                }

                xln = includes.length;
                if (this.project.license) {
                    file.writeln('/*\n' + this.project.license + '\n*/\n');
                }
                for (x = 0; x < xln; x++) {
                    include = includes[x];
                    includePath = include.path.replace(/\//g, Fs.sep);
                    includePath = this.project.jsbDir + Fs.sep + includePath + (include.name || include.text);
                    
                    if (args.verbose) {
                        this.log(' + ' + include.path + (include.name || include.text));
                    }
                    if (args.build) {
                        parsed = Parser.parse(includePath, args.build);
                    }
                    else {
                        include = new Stream(includePath);
                        parsed = include.readFile();
                        include.close();
                    }
                    file.writeln(parsed);
                }

                file.close();
            }
        }
        catch(e) {
            this.log('Failed to create targets with fileIncludes');
            this.error(e.toString());
        }
    },

    createTargets: function() {
        var project = this.project,
            pkgs = project.targets,
            args = this.args,
            ln = pkgs.length,
            i,
            pkg,
            fileName,
            x,
            xln,
            dep,
            deps,
            depPath,
            depFile,
            file,
            dir,
            path;

        try {
            for (i = 0; i < ln; i++) {
                pkg = pkgs[i];
                if (!pkg.packages) {
                    continue;
                }

                fileName = pkg.target;
                fileName = fileName.replace(/\//g, Fs.sep);
                
                if (fileName.indexOf('.js') != -1) {
                    fileName = fileName.substring(0, fileName.length - 3) + args.debugSuffix + '.js';
                }

                if (args.verbose) {
                    this.log('Building the "' + pkg.name + '" package as "' + fileName + '"');
                    this.log('This package is built by included dependencies.');
                }

                // create file
                if (fileName.indexOf(Fs.sep) != -1) {
                    dir = fileName.substr(0, fileName.lastIndexOf(Fs.sep));
                    fileName = fileName.replace(dir, '').substr(1);
                    path = Fs.mkdir(project.deployDir + Fs.sep + dir) + Fs.sep + fileName;
                }
                else {
                    path = project.deployDir + Fs.sep + fileName;
                }

                this.outputFiles[pkg.id || path] = {
                    id: pkg.id || path,
                    path: path,
                    compress: pkg.debug || pkg.isDebug
                };
                
                file = new Stream(path, 'w');

                // include files for this package
                deps = pkg.packages;
                xln = deps.length;
                if (args.verbose) {
                    this.log('- ' + xln + ' package(s) included.');
                }

                for (x = 0; x < xln; x++) {
                    dep = deps[x];
                    if (args.verbose) {
                        this.log(' + ' + dep);
                    }
                    if (dep.indexOf('.js') != -1) {
                        dep = dep.substring(0, dep.length - 3) + args.debugSuffix + '.js';
                        depPath = this.project.deployDir + Fs.sep + dep;
                    }
                    else {
                        dep = this.outputFiles[dep];
                        if (!dep) {
                            this.log(' ! ' + deps[x] + ' could not be found.');
                            continue;
                        }
                        depPath = dep.path;
                    }

                    depFile = new Stream(depPath);
                    file.writeln(depFile.readFile());
                    depFile.close();
                }

                file.close();
            }
        }
        catch(e) {
            this.log('Failed to create targets with fileIncludes');
            this.error(e.toString());
        }
    },

    copyResources: function() {
        this.log('Copying resources...');

        if (!this.project.config.resources) {
            return;
        }

        try {
            var project = this.project,
                args = this.args,
                resources = project.config.resources,
                ln = resources.length,
                i,
                resource,
                filters,
                srcDir,
                destDir;

            for (i = 0; i < ln; i++) {
                resource = resources[i];
                filters = resource.filters;

                srcDir = project.jsbDir + Fs.sep + resource.src.replace(/\//g, Fs.sep);
                if (Info.isWindows) {
                    destDir = project.deployDir + Fs.sep + (resource.dest && resource.dest.replace(/\//g, Fs.sep) || '');
                }
                else {
                    destDir = project.deployDir + Fs.sep + (resource.dest || resource.src);
                }

                Fs.copy(srcDir, destDir);
            }
        }
        catch(e) {
            this.log('Failed to copy resources');
            this.error(e.toString());
        }
    },

    compressOutputFiles: function() {
        this.log('Compressing output files...');

        var files = this.outputFiles,
            args = this.args,
            compressor, i, file, dest;


        // get the compressor path relative to the jsdb
        compressor = system.script.replace('jsbuilder.js', '') + 'ycompressor.jar';

        for (i in files) {
            file = files[i];
            if (!file.compress) {
                continue;
            }
            dest = file.path.replace(args.debugSuffix, '');
            if (dest.indexOf('.js') != -1) {
                this.log('- ' + dest);
                if (Info.isWindows) {
                    var compress = new Stream('exec://java -jar ' + compressor + ' --type js ' + file.path + ' -o ' + dest);
                    compress.close();                    
                }
                else {
                    system.execute('java -jar ' + compressor + ' --type js ' + file.path + ' -o ' + dest);
                }
            }
        }
    },

    openProjectFile: function() {
        try {
            var projectFile = this.args.projectFile,
                fileName = projectFile.split(/\\|\//i).pop(),
                dir = projectFile.replace(fileName, ''),
                file,
                contents,
                config;

            if (!system.exists(projectFile)) {
                throw 'Error: Project file doesn\'t exist';
            }

            dir = Fs.getFullPath(dir);
            file = new Stream(projectFile);
            contents = file.readFile();
            file.close();
        }
        catch(e) {
            this.log('Failed to open project file.');
            this.error(e.toString());
        }

        try {
            config = JSON.parse(contents);
        }
        catch(e) {
            this.error('The jsb file is corrupt.');
        }

        this.project = {
            name: config.projectName,
            license: config.licenseText,
            jsbDir: dir,
            fileName: fileName,
            config: config
        };

        this.log('Loading the ' + this.project.name + ' Project');
    },

    loadTargets: function() {
        try {
            this.project.targets = this.project.config.targets || this.project.config.pkgs;
            this.log('Loaded ' + this.project.targets.length + ' Packages');
        }
        catch(e) {
            this.log('Failed to find \'pkgs\' configuration.');
            this.error(e.toString());
        }
    },

    makeDeployDir: function() {
        try {
            var deployDir = this.args.homeDir;
            if (this.project.config.deployDir && this.project.config.deployDir.length > 0) {
                deployDir += Fs.sep + this.project.config.deployDir;
            }
            this.project.deployDir = Fs.mkdir(deployDir);
        }
        catch(e) {
            this.log('Failed to create deploy directory.');
            this.error(e.toString());
        }
    },

    error: function(string) {
        throw string;
    },

    log: function(string) {
        writeln(string);
    },

    printUsage: function() {
        this.log('');
        this.log('JSBuilder version ' + this.version);
        this.log('Ext JS, LLC.');
        this.log('');
        this.log('Available arguments:');
        this.log('    --projectFile -p   (REQUIRED) Location of a jsb2 project file');
        this.log('    --homeDir -d       (REQUIRED) Home directory to build the project to');
        this.log('    --verbose -v       (OPTIONAL) Output detailed information about what is being built');
        this.log('    --debugSuffix -s   (OPTIONAL) Suffix to append to JS debug targets, defaults to \'debug\'');
        this.log('    --compressor -c    (OPTIONAL) Dont compress the targets.');
        this.log('    --build -b         (OPTIONAL) The build name you want to target.');
        this.log('    --help -h          (OPTIONAL) Prints this help display.');
        this.log('');
        this.log('Example Usage:');
        this.log('');
        this.log('Windows:');
        this.log('jsdb JSBuilder2.js --projectFile C:\\Apps\\www\\ext3svn\\ext.jsb2 --homeDir C:\\Apps\\www\\deploy\\');
        this.log('');
        this.log('Linux and OS X:');
        this.log('jsdb JSBuilder2.js --projectFile /home/aaron/www/trunk/ext.jsb2 --homeDir /home/aaron/www/deploy/');
        this.log('');
        this.log('JSBuilder2 is a JavaScript and CSS project build tool.');
        this.log('For additional information, see http://extjs.com/products/jsbuilder/');
        this.log('');
    },

    parseArgs: function() {
        var args = system.arguments,
            ln = args.length,
            i,
            arg,
            parsedArgs = this.args = {},
            curArg = null;

        for (i = 0; i < ln; i++) {
            arg = args[i];
            if (arg[0] == '-') {
                if (arg[1] == '-') {
                    curArg = arg.substr(2);
                }
                else if (arg.length == 2) {
                    curArg = this.argMappings[arg[1]] || arg[1];
                }
                else {
                    continue;
                }

                if (args[i + 1] && args[i + 1][0] != '-') {
                    parsedArgs[curArg] = args[i + 1] || true;
                    i++;
                }
                else {
                    parsedArgs[curArg] = true;
                }
            }
        }

        return parsedArgs;
    }
};

Parser = {
    isBuild: function(builds) {
        return builds.split('|').indexOf(this.build) != -1;
    },

    parse: function(file, build) {
        var line,
            trimmed,
            o = this.output = [];

        this.build = build;

        file = new Stream(file);
        while (!file.eof) {
            line = file.readLine();
            trimmed = line.trim();
            if (this.isStatement(trimmed)) {
                this.handleStatement(this.parseStatement(trimmed), file);
            }
            else {
                this.output.push(line);
                this.checkExtraComma();
            }
        }
        file.close();
        return this.output.join('\n');
    },

    checkExtraComma: function() {
        var output = this.output,
            ln = output.length - 1,
            line = output[ln],
            trimmed = line.trim(),
            prevLine;

        if (trimmed[0] == '}') {
            while (output[--ln].trim() == '') {
                output.splice(ln, 1);
            }
            prevLine = output[ln];
            if (prevLine.trim().slice( - 1) == ',') {
                output[ln] = prevLine.slice(0, prevLine.lastIndexOf(','));
            }
        }
    },

    isStatement: function(line) {
        return line.substr(0, 3) == '//[' && line.substr( - 1) == ']';
    },

    handleStatement: function(statement, file) {
        switch (statement.type) {
        case 'if':
        case 'elseif':
            this.handleIf(file, statement.condition);
            break;

        case 'else':
            this.handleElse(file);
            break;
        }
    },

    parseStatement: function(statement) {
        var parts = statement.substring(3, statement.length - 1).split(' ');
        return {
            type: parts[0],
            condition: parts[1]
        };
    },

    handleIf: function(file, condition) {
        if (this.isBuild(condition)) {
            var next = this.getNextStatement(file);
            this.output.push(next.buffer);
            this.toEndIf(file, next);
        }
        else {
            this.handleStatement(this.getNextStatement(file), file);
        }
    },

    handleElse: function(file) {
        var next = this.toEndIf(file);
        this.output.push(next.buffer);
    },

    toEndIf: function(file, next) {
        next = next || this.getNextStatement(file);
        while (next && next.type != 'endif') {
            next = this.getNextStatement(file);
        }
        return next;
    },

    getNextStatement: function(file) {
        var buffer = [],
            line,
            trimmed,
            ret;

        while (!file.eof) {
            line = file.readLine();
            trimmed = line.trim();
            if (!this.isStatement(trimmed)) {
                buffer.push(line);
            }
            else {
                ret = this.parseStatement(trimmed);
                ret.buffer = buffer.join('\n');
                return ret;
            }
        }
        return null;
    }
};

Fs = {
    getFullPath: function(path) {
        var currentPath = system.setcwd(path);
        return system.setcwd(currentPath);
    },

    mkdir: function(path) {
        if (Info.isWindows) {
            system.mkdir(path);
        }
        else {
            system.execute('mkdir -p ' + path);
        }
        return this.getFullPath(path);
    },

    copy: function(src, dest) {
        if (Info.isWindows) {
            if(Fs.endsWith(src, Fs.sep)){
                // It's a directory
                
                // remove the trailing \
                src = src.substr(0, src.length - 1);
                
                var folders = src.split(Fs.sep),
                    folder = folders[folders.length - 1]; 
                        
                // Ensure we have a trailing \ on the directory
                dest += (Fs.endsWith(dest, Fs.sep) ? '' : Fs.sep) + folder + Fs.sep;
            }
            var copy = new Stream('exec://xcopy ' + src + ' ' + dest + ' /E /Y /I');
            copy.close();
        }
        else {
            try {
                system.execute('rsync -qrup ' + src + ' ' + dest);
            }
            catch(e) {
                system.execute('cp -Rpf ' + src + ' ' + dest);
            }
        }
    },
    
    endsWith: function(str, last){
        return str.lastIndexOf(last) == str.length - 1;
    },

    split: function(file) {
        var split = [];
        if (!system.exists(file)) {
            return split;
        }
        file = new Stream(file);
        while (!file.eof) {
            split.push(file.readln().trim());
        }
        return split;
    }
};

Fs.sep = (Fs.getFullPath('.')[0] == '/') ? '/': '\\';
Fs.fileWorkingDir = Fs.getFullPath('.');

Info = {
    isUnix: Fs.sep == '/',
    isWindows: Fs.sep != '/'
};

JSBuilder.run();