import Post from '../model/post';
import Comment from '../model/comment';
import User from '../model/user';
import Hands from '../model/hands';
import { rename } from '../common/utils';
import { getJWTPayload, checkCode, getUserStatus } from '../common/utils';

class CommentController {
  /**
   * 获取帖子评论列表
   * @param {*} ctx
   */
  async getComments(ctx) {
    const body = ctx.query;
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 10;
    const data = await Comment.getCommentsTid(body.tid, page, limit);
    const total = await Comment.queryCount(body.tid);
    let list = data.map((item) => {
      return rename(item.toJSON(), 'uid', 'user');
    });
    const payload = await getJWTPayload(ctx.header.authorization);
    if (payload) {
      for (let i = 0; i < list.length; i++) {
        const hands = await Hands.findOne({
          uid: payload._id,
          cid: list[i]._id,
        });
        if (hands) {
          list[i].isHands = '1';
        } else {
          list[i].isHands = '0';
        }
      }
    }
    ctx.body = {
      code: 10000,
      data: {
        list,
        total,
      },
      message: '获取评论列表成功',
    };
  }

  /**
   * 用户发表评论信息
   * @param {*} ctx
   */
  async postComment(ctx) {
    const { body } = ctx.request;
    const result = await checkCode(body.sid, body.code);
    if (result) {
      const payload = await getJWTPayload(ctx.header.authorization);
      const result = await getUserStatus(payload._id);
      if (result.code !== 10000) {
        ctx.body = result;
        return;
      }
      const postInfo = await Post.findOne({ _id: body.tid });
      const newComment = new Comment({
        tid: body.tid,
        uid: payload._id,
        tuid: postInfo.uid,
        content: body.content,
      });
      const saveResult = await newComment.save();
      await Post.updateOne({ _id: body.tid }, { $inc: { answer: 1 } });

      const total = await global.ws.getAllMsg(postInfo.uid);
      // 推送消息给客户端
      if (payload._id !== postInfo.uid) {
        global.ws.send(
          postInfo.uid,
          JSON.stringify({
            event: 'message',
            message: total,
          })
        );
      }

      ctx.body = {
        code: 10000,
        data: saveResult,
        message: '评论发表成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '验证码不正确或者已失效',
      };
    }
  }

  /**
   * 用户更新评论信息
   * @param {*} ctx
   */
  async updateComment(ctx) {
    const { body } = ctx.request;
    const result = await checkCode(body.sid, body.code);
    if (result) {
      const payload = await getJWTPayload(ctx.header.authorization);
      const result = await getUserStatus(payload._id);
      if (result.code !== 10000) {
        ctx.body = result;
        return;
      }
      const updateResult = await Comment.updateOne(
        { _id: body.cid },
        { $set: { content: body.content } }
      );
      if (updateResult.n === 1 && updateResult.ok === 1) {
        ctx.body = {
          code: 10000,
          message: '评论更新成功',
        };
      } else {
        ctx.body = {
          code: 9004,
          message: '更新失败，请重试',
        };
      }
    } else {
      ctx.body = {
        code: 9000,
        message: '验证码不正确或者已失效',
      };
    }
  }

  /**
   * 采纳最佳答案
   * @param {*} ctx
   */
  async setBestComment(ctx) {
    const { body } = ctx.request;
    const payload = await getJWTPayload(ctx.header.authorization);
    const comment = await Comment.findOne({ _id: body.cid });
    const post = await Post.findOne({ _id: body.tid });
    if (post.uid !== payload._id) {
      ctx.body = {
        code: 9001,
        message: '用户未授权',
      };
      return;
    }
    if (payload._id === comment.uid) {
      ctx.body = {
        code: 9002,
        message: '不能采纳自己的评论',
      };
      return;
    }
    const postResult = await Post.updateOne(
      { _id: body.tid },
      { $set: { isEnd: '1' } }
    );
    const commentResult = await Comment.updateOne(
      { _id: body.cid },
      { $set: { isBest: '1' } }
    );
    const userResult = await User.updateOne(
      { _id: comment.uid },
      { $inc: { favs: parseInt(post.fav) } }
    );
    if (postResult.ok === 1 && commentResult.ok === 1 && userResult.ok === 1) {
      ctx.body = {
        code: 10000,
        message: '恭喜你，采纳成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '采纳失败，请重试',
      };
    }
  }

  /**
   * 点赞评论
   * @param {*} ctx
   */
  async setHandsComment(ctx) {
    const body = ctx.query;
    const payload = await getJWTPayload(ctx.header.authorization);
    const hands = await Hands.findOne({ uid: payload._id, cid: body.cid });
    if (hands) {
      const delResult = await Hands.deleteOne({
        uid: payload._id,
        cid: body.cid,
      });
      const updResult = await Comment.updateOne(
        { _id: body.cid },
        { $inc: { hands: -1 } }
      );
      if (delResult.ok === 1 && updResult.ok === 1) {
        ctx.body = {
          code: 10000,
          message: '取消点赞成功',
        };
      } else {
        ctx.body = {
          code: 9001,
          message: '取消点赞失败',
        };
      }
      return;
    }
    const comment = await Comment.findOne({ _id: body.cid });
    const newHands = new Hands({
      uid: payload._id,
      cid: body.cid,
      cuid: comment.uid,
    });
    await newHands.save();
    const result = await Comment.updateOne(
      { _id: body.cid },
      { $inc: { hands: 1 } }
    );
    const total = await global.ws.getAllMsg(comment.uid);
    // 推送消息给客户端
    if (payload._id !== comment.uid) {
      global.ws.send(
        comment.uid,
        JSON.stringify({
          event: 'message',
          message: total,
        })
      );
    }
    if (result.ok === 1) {
      ctx.body = {
        code: 10000,
        message: '点赞成功',
      };
    } else {
      ctx.body = {
        code: 9000,
        message: '点赞失败，请重试',
      };
    }
  }
}

export default new CommentController();
