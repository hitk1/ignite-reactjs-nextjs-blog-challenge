import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import format from 'date-fns/format'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { ptBR } from 'date-fns/locale';

export interface Post {
  uid: string
  first_publication_date: string | null;
  data: {
    title: string;
    author: string;
    subtitle: string;
    banner: {
      url: string;
    };
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  const timeRead = post.data.content.reduce((prev, curr) => {
    const headingTotal = curr.heading.split(' ').length
    const bodyText = RichText.asText(curr.body).split(' ').length

    return prev += headingTotal + bodyText
  }, 0)

  return (
    router.isFallback
      ? (
        <div>Carregando...</div>
      )
      :
      (
        <>
          <Head>
            <title>Post | {post.data.title}</title>
          </Head>
          <header className={styles.imgHeader}>
            <img src={post.data.banner.url} alt="Image alt" />
          </header>
          <main className={styles.container}>
            <section>
              <h2 className={styles.title}>{post.data.title}</h2>
              <div className={styles.metadataInfo}>
                <div>
                  <FiCalendar
                    color="#BBBBBB"
                    size={22} />
                  <time>{format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}</time>
                </div>
                <div>
                  <FiUser
                    color="#BBBBBB"
                    size={22} />
                  <p>{post.data.author}</p>
                </div>
                <div>
                  <FiClock
                    color="#BBBBBB"
                    size={22} />
                  <p>{Math.ceil(timeRead / 200)} min</p>
                </div>
              </div>
            </section>
            <article>
              {post.data.content.map((content, index) => (
                <div key={content.heading}>
                  <h1>{content.heading}</h1>
                  <div
                    className={styles.contentBody}
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                  />
                </div>
              ))}
            </article>
          </main>
        </>
      )
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],
    {
      fetch: ['post.title', 'post.author', 'post.banner', 'post.content'],
      pageSize: 2
    }
  )

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid }
    })),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient()
  const response = await prismic.getByUID('post', String(slug), {})

  console.log(response.data.author)

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(contentBody => ({
        heading: contentBody.heading,
        body: contentBody.body
      }))
    }
  }

  return {
    props: {
      post
    }
  }
};
