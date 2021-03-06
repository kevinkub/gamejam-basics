define(['basic/entity', 'geo/v2', 'geo/rect'], function(Entity, V2, Rect) {
	function Movement(subject, pos, duration, callback) {
		this.duration = duration;
		this.anitime = 0;

		this.subject = subject;
		this.start = subject.position.clone();
		this.end = pos;
		this.dist = pos.dif(this.start);

		this.callback = callback;
	}

	Movement.prototype.setParent = function(p) {
		this.parent = p;
	};

	Movement.prototype.update = function(delta) {
		this.anitime += delta;

		if(this.anitime > this.duration) {
			this.subject.setPosition(this.end.x, this.end.y);
			this.parent.remove(this);
			if(this.callback) this.callback();
		} else {
			var pos = this.start.sum(this.dist.prd(this.anitime/this.duration));
			this.subject.setPosition(pos.x, pos.y);
		}
	};

	function ViewPort(updateHidden) {
		Entity.call(this);
		this.updateHidden = updateHidden;
		this.subject = null;
		this.drag = false;
		this.dragging = null;
	}

	ViewPort.prototype = new Entity();

	ViewPort.prototype.setParent = function(p) {
		this.parent = p;
		this.visible = p.size.clone();
	};

	ViewPort.prototype.getVisibleArea = function() {
		if(this.size.x == 0 && this.size.y == 0) this.inheritSize();
		var pos = this.position.inverse();
		return new Rect(pos, pos.sum(this.visible));
	};

	ViewPort.prototype.dispatch = function(list, event, argurment) {
		for (var i = 0; i < list.length; i++)
			if (list[i][event]) {

				if(event == 'draw' && this.getVisibleArea().collision(list[i].relativeArea()))
					list[i].draw(argurment);
				if(event == 'update' && (this.updateHidden || this.getVisibleArea().collision(list[i].relativeArea())))
					list[i].update(argurment);
				else
					list[i][event](argurment);
			}
	};

	ViewPort.prototype.follow = function(entity) {
		this.subject = entity;
	};

	ViewPort.prototype.scrollTo = function(pos, speed, callback) {
		this.add(new Movement(this, pos, speed, callback));
	};

	ViewPort.prototype.dragable = function(status) {
		this.drag = status;
	};

	ViewPort.prototype.onMouseDown = function(pos) {
		if(this.drag) this.dragging = pos;
	};

	ViewPort.prototype.onMouseUp = function(pos) {
		if(this.drag) this.dragging = null;
	};

	ViewPort.prototype.setPosition = function(x, y) {
		this.position.x = Math.max(Math.min(0, x), this.visible.x-this.size.x );
		this.position.y = Math.max(Math.min(0, y), this.visible.y-this.size.y );
	};

	ViewPort.prototype.update = function(delta) {
		Entity.prototype.update.call(this, delta);

		if( this.subject ) {
			this.setPosition( this.visible.x/2-this.subject.position.x, this.visible.y/2-this.subject.position.y );
		} else if( this.dragging ) {
			var pos = this.parent.relativeMouse().dif(this.dragging);
			this.setPosition( pos.x, pos.y );
		}
	};

	return ViewPort;
});

